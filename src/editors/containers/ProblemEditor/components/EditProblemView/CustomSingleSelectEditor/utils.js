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

export const ANSWER_TYPES = {
  SINGLECHOICE: 'singlechoice',
  MULTIPLECHOICE: 'multiplechoice',
  DROPDOWN: 'dropdown',
  NUMERICAL: 'numerical',
  TEXT: 'text',
};

const RESPONSE_TYPE_TO_ANSWER_TYPE = {
  multiplechoiceresponse: ANSWER_TYPES.SINGLECHOICE,
  choiceresponse: ANSWER_TYPES.MULTIPLECHOICE,
  optionresponse: ANSWER_TYPES.DROPDOWN,
  numericalresponse: ANSWER_TYPES.NUMERICAL,
  stringresponse: ANSWER_TYPES.TEXT,
};

const isEmptyHtml = (html) => {
  const text = (html || '').replace(/<[^>]*>/g, '').replace(/&[a-z0-9#]+;/gi, '').trim();
  return text.length === 0;
};

export const getDefaultAnswers = (answerType) => {
  if (answerType === ANSWER_TYPES.NUMERICAL || answerType === ANSWER_TYPES.TEXT) {
    return [{ id: 0, text: '', correct: true }];
  }
  return [
    { id: 0, text: '', correct: true },
    { id: 1, text: '', correct: false },
    { id: 2, text: '', correct: false },
  ];
};

export const createEmptyGroup = (id, answerType = ANSWER_TYPES.SINGLECHOICE) => ({
  id,
  question: '',
  explanation: '',
  answerType,
  answers: getDefaultAnswers(answerType),
});

const buildSolutionBlock = (explanation) => {
  if (isEmptyHtml(explanation)) { return ''; }
  return `\n    <solution>\n      <div class="detailed-solution">\n        <p>Explanation</p>\n        ${explanation}\n      </div>\n    </solution>`;
};

export const buildOLX = (groups) => {
  const responses = groups.map((group) => {
    const answerType = group.answerType || ANSWER_TYPES.SINGLECHOICE;
    const label = `    <label>${group.question || ''}</label>`;
    const solution = buildSolutionBlock(group.explanation);

    if (answerType === ANSWER_TYPES.SINGLECHOICE) {
      const choices = group.answers.map(
        (ans) => `      <choice correct="${ans.correct}">${ans.text || ''}</choice>`,
      ).join('\n');
      return [
        '  <multiplechoiceresponse>',
        label,
        '    <choicegroup type="MultipleChoice">',
        choices,
        '    </choicegroup>',
        solution,
        '  </multiplechoiceresponse>',
      ].filter(Boolean).join('\n');
    }

    if (answerType === ANSWER_TYPES.MULTIPLECHOICE) {
      const choices = group.answers.map(
        (ans) => `      <choice correct="${ans.correct}">${ans.text || ''}</choice>`,
      ).join('\n');
      return [
        '  <choiceresponse>',
        label,
        '    <checkboxgroup>',
        choices,
        '    </checkboxgroup>',
        solution,
        '  </choiceresponse>',
      ].filter(Boolean).join('\n');
    }

    if (answerType === ANSWER_TYPES.DROPDOWN) {
      const options = group.answers.map(
        (ans) => `      <option correct="${ans.correct ? 'True' : 'False'}">${ans.text || ''}</option>`,
      ).join('\n');
      return [
        '  <optionresponse>',
        label,
        '    <optioninput>',
        options,
        '    </optioninput>',
        solution,
        '  </optionresponse>',
      ].filter(Boolean).join('\n');
    }

    if (answerType === ANSWER_TYPES.NUMERICAL) {
      const answer = group.answers[0]?.text || '0';
      return [
        `  <numericalresponse answer="${answer}">`,
        label,
        '    <formulaequationinput/>',
        solution,
        '  </numericalresponse>',
      ].filter(Boolean).join('\n');
    }

    if (answerType === ANSWER_TYPES.TEXT) {
      const answer = group.answers[0]?.text || '';
      return [
        `  <stringresponse answer="${answer}" type="ci">`,
        label,
        '    <textline size="20"/>',
        solution,
        '  </stringresponse>',
      ].filter(Boolean).join('\n');
    }

    return '';
  });

  return `<problem x-custom-type="customsingleselect">\n${responses.filter(Boolean).join('\n')}\n</problem>`;
};

export const parseGroupsFromOLX = (olx) => {
  if (!olx) { return [createEmptyGroup(0)]; }

  try {
    const parser = new XMLParser(parserOptions);
    const builder = new XMLBuilder(builderOptions);
    const parsed = parser.parse(olx);

    const problemArr = parsed[0]?.problem;
    if (!problemArr) { return [createEmptyGroup(0)]; }

    const responseElementNames = Object.keys(RESPONSE_TYPE_TO_ANSWER_TYPE);
    const responses = problemArr.filter(
      (section) => responseElementNames.includes(Object.keys(section)[0]),
    );
    if (responses.length === 0) { return [createEmptyGroup(0)]; }

    return responses.map((responseSection, idx) => {
      const elementName = Object.keys(responseSection)[0];
      const answerType = RESPONSE_TYPE_TO_ANSWER_TYPE[elementName] || ANSWER_TYPES.SINGLECHOICE;
      const responseAttrs = responseSection[':@'] || {};
      const responseContent = responseSection[elementName];

      const labelSection = responseContent.find((s) => Object.keys(s)[0] === 'label');
      const question = labelSection ? builder.build(labelSection.label) : '';

      let explanation = '';
      const solutionSection = responseContent.find((s) => Object.keys(s)[0] === 'solution');
      if (solutionSection) {
        const divSection = solutionSection.solution.find((s) => Object.keys(s)[0] === 'div');
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

      let answers;
      if (answerType === ANSWER_TYPES.SINGLECHOICE) {
        const cgSection = responseContent.find((s) => Object.keys(s)[0] === 'choicegroup');
        const choiceSections = cgSection
          ? cgSection.choicegroup.filter((s) => Object.keys(s)[0] === 'choice')
          : [];
        answers = choiceSections.map((choiceSection, ci) => {
          const attrs = choiceSection[':@'] || {};
          const correct = String(attrs['@_correct'] ?? 'false').toLowerCase() === 'true';
          const text = builder.build(choiceSection.choice);
          return { id: ci, text, correct };
        });
        if (answers.length === 0) { answers = getDefaultAnswers(answerType); }
      } else if (answerType === ANSWER_TYPES.MULTIPLECHOICE) {
        const cgSection = responseContent.find((s) => Object.keys(s)[0] === 'checkboxgroup');
        const choiceSections = cgSection
          ? cgSection.checkboxgroup.filter((s) => Object.keys(s)[0] === 'choice')
          : [];
        answers = choiceSections.map((choiceSection, ci) => {
          const attrs = choiceSection[':@'] || {};
          const correct = String(attrs['@_correct'] ?? 'false').toLowerCase() === 'true';
          const text = builder.build(choiceSection.choice);
          return { id: ci, text, correct };
        });
        if (answers.length === 0) { answers = getDefaultAnswers(answerType); }
      } else if (answerType === ANSWER_TYPES.DROPDOWN) {
        const oiSection = responseContent.find((s) => Object.keys(s)[0] === 'optioninput');
        const optionSections = oiSection
          ? oiSection.optioninput.filter((s) => Object.keys(s)[0] === 'option')
          : [];
        answers = optionSections.map((optionSection, ci) => {
          const attrs = optionSection[':@'] || {};
          const correct = String(attrs['@_correct'] ?? 'false').toLowerCase() === 'true';
          const text = builder.build(optionSection.option);
          return { id: ci, text, correct };
        });
        if (answers.length === 0) { answers = getDefaultAnswers(answerType); }
      } else if (answerType === ANSWER_TYPES.NUMERICAL || answerType === ANSWER_TYPES.TEXT) {
        answers = [{ id: 0, text: responseAttrs['@_answer'] || '', correct: true }];
      } else {
        answers = getDefaultAnswers(answerType);
      }

      return {
        id: idx,
        question,
        explanation,
        answerType,
        answers,
      };
    });
  } catch {
    return [createEmptyGroup(0)];
  }
};

/**
 * At save time, reads live HTML content from window.tinymce editor instances
 * and merges it with the group structure from rawOLX.
 * For numerical/text types, values are already current in rawOLX via useEffect.
 */
export const buildOLXFromTinyMCEEditors = (rawOLX) => {
  const groups = parseGroupsFromOLX(rawOLX);
  const tinyMCE = window.tinymce;
  // Only single-select and multi-select use TinyMCE for answer text.
  // Dropdown uses plain textarea (values already in rawOLX via useEffect).
  // Numerical and Text use plain inputs (same).
  const usesTinyMCEAnswers = (type) => (
    type === ANSWER_TYPES.SINGLECHOICE || type === ANSWER_TYPES.MULTIPLECHOICE
  );

  const updatedGroups = groups.map((group) => {
    const qEditor = tinyMCE?.get(`css-q-${group.id}-question`);
    const eEditor = tinyMCE?.get(`css-q-${group.id}-explanation`);
    const question = qEditor ? qEditor.getContent() : group.question;
    const explanation = eEditor ? eEditor.getContent() : group.explanation;

    let answers;
    if (usesTinyMCEAnswers(group.answerType)) {
      answers = group.answers.map((ans) => {
        const aEditor = tinyMCE?.get(`css-q-${group.id}-answer-${ans.id}`);
        const text = aEditor ? aEditor.getContent() : ans.text;
        return { ...ans, text };
      });
    } else {
      answers = group.answers;
    }

    return {
      ...group,
      question,
      explanation,
      answers,
    };
  });

  return buildOLX(updatedGroups);
};
