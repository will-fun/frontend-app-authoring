import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Icon,
  IconButton,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import TinyMceWidget, { prepareEditorRef } from '../../../../../sharedComponents/TinyMceWidget';
import ExpandableTextArea from '../../../../../sharedComponents/ExpandableTextArea';
import Button from '../../../../../sharedComponents/Button';
import Checker from '../AnswerWidget/components/Checker';
import { selectors } from '../../../../../data/redux';
import { indexToLetterMap } from '../../../data/OLXParser';
import messages from '../AnswerWidget/messages';

// Thin wrapper so each group gets its own TinyMCE editor ref
const GroupEditor = ({
  id, editorType, content, onUpdate, minHeight, images, isLibrary, learningContextId,
}) => {
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  if (!refReady) { return null; }
  return (
    <TinyMceWidget
      id={id}
      editorType={editorType}
      editorRef={editorRef}
      editorContentHtml={content}
      setEditorRef={setEditorRef}
      updateContent={onUpdate}
      minHeight={minHeight}
      images={images}
      isLibrary={isLibrary}
      learningContextId={learningContextId}
    />
  );
};

GroupEditor.defaultProps = { minHeight: 150 };
GroupEditor.propTypes = {
  id: PropTypes.string.isRequired,
  editorType: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  minHeight: PropTypes.number,
  images: PropTypes.shape({}).isRequired,
  isLibrary: PropTypes.bool.isRequired,
  learningContextId: PropTypes.string.isRequired,
};

// -

const QuestionGroup = ({
  group, index, onChange, onRemove, isOnly,
}) => {
  const intl = useIntl();
  const images = useSelector(selectors.app.images);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const learningContextId = useSelector(selectors.app.learningContextId);

  const n = index + 1;

  const updateQuestion = (html) => onChange({ ...group, question: html });
  const updateExplanation = (html) => onChange({ ...group, explanation: html });

  const updateAnswerText = (ansId, html) => {
    const answers = group.answers.map((a) => (a.id === ansId ? { ...a, text: html } : a));
    onChange({ ...group, answers });
  };

  const setAnswerCorrect = (ansId) => {
    const answers = group.answers.map((a) => ({ ...a, correct: a.id === ansId }));
    onChange({ ...group, answers });
  };

  const addAnswer = () => {
    const nextId = group.answers.length > 0
      ? Math.max(...group.answers.map((a) => a.id)) + 1
      : 0;
    onChange({ ...group, answers: [...group.answers, { id: nextId, text: '', correct: false }] });
  };

  const removeAnswer = (ansId) => {
    let answers = group.answers.filter((a) => a.id !== ansId);
    if (answers.length > 0 && !answers.some((a) => a.correct)) {
      answers = answers.map((a, i) => ({ ...a, correct: i === 0 }));
    }
    onChange({ ...group, answers });
  };

  return (
    <div className="mb-5">
      {/* - Question - */}
      <div className="tinyMceWidget">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="h4 m-0">{`Question ${n}`}</div>
          {!isOnly && (
            <IconButton
              src={DeleteOutline}
              iconAs={Icon}
              alt={`Hapus Pertanyaan ${n}`}
              onClick={onRemove}
              variant="primary"
            />
          )}
        </div>
        <GroupEditor
          id={`css-q-${group.id}-question`}
          editorType="question"
          content={group.question}
          onUpdate={updateQuestion}
          images={images}
          isLibrary={isLibrary}
          learningContextId={learningContextId}
        />
      </div>

      {/* - Explanation - */}
      <div className="tinyMceWidget mt-4 text-primary-500">
        <div className="h4 mb-3">{`Explanation ${n}`}</div>
        <div className="small mb-3">
          Tulis penjelasan jawaban yang benar untuk pertanyaan ini.
        </div>
        <GroupEditor
          id={`css-q-${group.id}-explanation`}
          editorType="solution"
          content={group.explanation}
          onUpdate={updateExplanation}
          images={images}
          isLibrary={isLibrary}
          learningContextId={learningContextId}
        />
      </div>

      {/* - Answers - */}
      <div className="mt-4 text-primary-500">
        <div className="h4">{`Answers ${n}`}</div>
        <div className="small mb-3">
          Tandai jawaban yang benar. Learner harus memilih satu jawaban yang benar.
        </div>
        <div className="answers-container border border-light-700 rounded py-4 pl-4 pr-3">
          {group.answers.map((ans, ai) => (
            <div
              key={ans.id}
              className="answer-option d-flex flex-row justify-content-between flex-nowrap pb-2 pt-2"
            >
              <div className="mr-1 d-flex">
                <Checker
                  hasSingleAnswer={false}
                  answer={{ id: indexToLetterMap[ai], correct: ans.correct }}
                  setAnswer={({ correct }) => { if (correct) { setAnswerCorrect(ans.id); } }}
                />
              </div>
              <div className="ml-1 flex-grow-1">
                <ExpandableTextArea
                  id={`css-q-${group.id}-answer-${ans.id}`}
                  value={ans.text}
                  setContent={(html) => updateAnswerText(ans.id, html)}
                  placeholder={intl.formatMessage(messages.answerTextboxPlaceholder)}
                  images={images}
                  isLibrary={isLibrary}
                  learningContextId={learningContextId}
                />
              </div>
              {group.answers.length > 1 && (
                <IconButton
                  src={DeleteOutline}
                  iconAs={Icon}
                  alt={intl.formatMessage(messages.answerDeleteIconAltText)}
                  onClick={() => removeAnswer(ans.id)}
                  variant="primary"
                />
              )}
            </div>
          ))}
          <Button variant="add" onClick={addAnswer}>
            <FormattedMessage {...messages.addAnswerButtonText} />
          </Button>
        </div>
      </div>
    </div>
  );
};

QuestionGroup.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    explanation: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      correct: PropTypes.bool.isRequired,
    })).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  isOnly: PropTypes.bool.isRequired,
};

export default QuestionGroup;
