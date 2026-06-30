import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parserOptions = {
  ignoreAttributes: false,
  alwaysCreateTextNode: true,
  preserveOrder: true,
  trimValues: false,
  numberParseOptions: { leadingZeros: false, hex: false },
};
const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  suppressBooleanAttributes: false,
  format: false,
  preserveOrder: true,
  trimValues: false,
};

const isEmptyHtml = (html) => {
  const text = (html || '').replace(/<[^>]*>/g, '').replace(/&[a-z0-9#]+;/gi, '').trim();
  return text.length === 0;
};

export const createEmptyGroup = (id) => ({
  id,
  question: '',
  explanation: '',
  answers: [
    { id: 0, text: '', correct: true },
    { id: 1, text: '', correct: false },
    { id: 2, text: '', correct: false },
  ],
});

export const buildOLX = (groups) => {
  const responses = groups.map((group) => {
    const choices = group.answers.map(
      (ans) => `      <choice correct="${ans.correct}">${ans.text || ''}</choice>`,
    ).join('\n');

    const solutionBlock = !isEmptyHtml(group.explanation)
      ? `\n    <solution>\n      <div class="detailed-solution">\n        <p>Explanation</p>\n        ${group.explanation}\n      </div>\n    </solution>`
      : '';

    return [
      '  <multiplechoiceresponse>',
      `    <label>${group.question || ''}</label>`,
      '    <choicegroup type="MultipleChoice">',
      choices,
      '    </choicegroup>',
      solutionBlock,
      '  </multiplechoiceresponse>',
    ].filter(Boolean).join('\n');
  });

  return `<problem x-custom-type="customsingleselect">\n${responses.join('\n')}\n</problem>`;
};

export const parseGroupsFromOLX = (olx) => {
  if (!olx) { return [createEmptyGroup(0)]; }

  try {
    const parser = new XMLParser(parserOptions);
    const builder = new XMLBuilder(builderOptions);
    const parsed = parser.parse(olx);

    const problemArr = parsed[0]?.problem;
    if (!problemArr) { return [createEmptyGroup(0)]; }

    const responses = problemArr.filter(
      (section) => Object.keys(section)[0] === 'multiplechoiceresponse',
    );
    if (responses.length === 0) { return [createEmptyGroup(0)]; }

    return responses.map((responseSection, idx) => {
      const responseContent = responseSection.multiplechoiceresponse;

      // Extract question HTML from <label>
      const labelSection = responseContent.find(
        (s) => Object.keys(s)[0] === 'label',
      );
      const question = labelSection ? builder.build(labelSection.label) : '';

      // Extract explanation HTML from <solution><div>...</div></solution>
      let explanation = '';
      const solutionSection = responseContent.find(
        (s) => Object.keys(s)[0] === 'solution',
      );
      if (solutionSection) {
        const divSection = solutionSection.solution.find(
          (s) => Object.keys(s)[0] === 'div',
        );
        if (divSection) {
          const explTags = divSection.div.filter((tag) => {
            const tagName = Object.keys(tag)[0];
            if (tagName === '#text') { return false; }
            const firstChild = tag[tagName]?.[0];
            const textContent = firstChild?.['#text'] ?? '';
            return String(textContent).trim() !== 'Explanation';
          });
          explanation = builder.build(explTags);
        }
      }

      // Extract choices from <choicegroup>
      const cgSection = responseContent.find(
        (s) => Object.keys(s)[0] === 'choicegroup',
      );
      const choiceSections = cgSection
        ? cgSection.choicegroup.filter((s) => Object.keys(s)[0] === 'choice')
        : [];

      const answers = choiceSections.map((choiceSection, ci) => {
        const attrs = choiceSection[':@'] || {};
        const correct = String(attrs['@_correct'] ?? 'false').toLowerCase() === 'true';
        const text = builder.build(choiceSection.choice);
        return { id: ci, text, correct };
      });

      if (answers.length === 0) {
        return {
          id: idx,
          question,
          explanation,
          answers: [
            { id: 0, text: '', correct: true },
            { id: 1, text: '', correct: false },
            { id: 2, text: '', correct: false },
          ],
        };
      }

      return {
        id: idx, question, explanation, answers,
      };
    });
  } catch {
    return [createEmptyGroup(0)];
  }
};

/**
 * At save time, reads live HTML content from window.tinymce editor instances
 * and merges it with the group structure (IDs, correct-answer flags) from rawOLX.
 * This mirrors how fetchEditorContent() works for the built-in problem editors.
 */
export const buildOLXFromTinyMCEEditors = (rawOLX) => {
  const groups = parseGroupsFromOLX(rawOLX);
  const tinyMCE = window.tinymce;

  const updatedGroups = groups.map((group) => {
    const qEditor = tinyMCE?.get(`css-q-${group.id}-question`);
    const eEditor = tinyMCE?.get(`css-q-${group.id}-explanation`);
    const question = qEditor ? qEditor.getContent() : group.question;
    const explanation = eEditor ? eEditor.getContent() : group.explanation;

    const answers = group.answers.map((ans) => {
      const aEditor = tinyMCE?.get(`css-q-${group.id}-answer-${ans.id}`);
      const text = aEditor ? aEditor.getContent() : ans.text;
      return { ...ans, text };
    });

    return {
      ...group, question, explanation, answers,
    };
  });

  return buildOLX(updatedGroups);
};
