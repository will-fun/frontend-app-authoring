import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Form,
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
import answerWidgetMessages from '../AnswerWidget/messages';
import messages from './messages';
import { ANSWER_TYPES, getDefaultAnswers } from './utils';

// Thin wrapper so each group gets its own TinyMCE editor ref
const GroupEditor = ({
  id,
  editorType,
  content,
  onUpdate,
  minHeight,
  images,
  isLibrary,
  learningContextId,
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

const ANSWER_TYPE_LABELS = {
  [ANSWER_TYPES.SINGLECHOICE]: messages.answerTypeSingleSelect,
  [ANSWER_TYPES.MULTIPLECHOICE]: messages.answerTypeMultiSelect,
  [ANSWER_TYPES.DROPDOWN]: messages.answerTypeDropdown,
  [ANSWER_TYPES.NUMERICAL]: messages.answerTypeNumericalInput,
  [ANSWER_TYPES.TEXT]: messages.answerTypeTextInput,
};

const ANSWER_TYPE_DESCRIPTIONS = {
  [ANSWER_TYPES.SINGLECHOICE]: messages.singleSelectDescription,
  [ANSWER_TYPES.MULTIPLECHOICE]: messages.multiSelectDescription,
  [ANSWER_TYPES.DROPDOWN]: messages.dropdownDescription,
  [ANSWER_TYPES.NUMERICAL]: messages.numericalDescription,
  [ANSWER_TYPES.TEXT]: messages.textDescription,
};

// -

const QuestionGroup = ({
  group,
  index,
  onChange,
  onRemove,
  isOnly,
}) => {
  const intl = useIntl();
  const images = useSelector(selectors.app.images);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const learningContextId = useSelector(selectors.app.learningContextId);

  const n = index + 1;
  const answerType = group.answerType || ANSWER_TYPES.SINGLECHOICE;
  // Rich-text choice types: ExpandableTextArea (TinyMCE) per answer
  const isRichChoiceType = answerType === ANSWER_TYPES.SINGLECHOICE || answerType === ANSWER_TYPES.MULTIPLECHOICE;
  // Plain-text choice type: textarea per answer (dropdown options must be plain text for LMS)
  const isDropdownType = answerType === ANSWER_TYPES.DROPDOWN;
  const hasSingleAnswer = answerType !== ANSWER_TYPES.MULTIPLECHOICE;

  const updateQuestion = (html) => onChange({ ...group, question: html });
  const updateExplanation = (html) => onChange({ ...group, explanation: html });

  const updateAnswerText = (ansId, value) => {
    const answers = group.answers.map((a) => (a.id === ansId ? { ...a, text: value } : a));
    onChange({ ...group, answers });
  };

  const setSingleCorrectAnswer = (ansId) => {
    onChange({ ...group, answers: group.answers.map((a) => ({ ...a, correct: a.id === ansId })) });
  };

  const toggleCorrectAnswer = (ansId, correct) => {
    const answers = group.answers.map((a) => (a.id === ansId ? { ...a, correct } : a));
    if (!answers.some((a) => a.correct)) { return; }
    onChange({ ...group, answers });
  };

  const addAnswer = () => {
    const newId = group.answers.length;
    onChange({ ...group, answers: [...group.answers, { id: newId, text: '', correct: false }] });
  };

  const removeAnswer = (ansId) => {
    let answers = group.answers.filter((a) => a.id !== ansId);
    answers = answers.map((a, i) => ({ ...a, id: i }));
    if (answers.length > 0 && !answers.some((a) => a.correct)) {
      answers = answers.map((a, i) => ({ ...a, correct: i === 0 }));
    }
    onChange({ ...group, answers });
  };

  const handleAnswerTypeChange = (newType) => {
    onChange({ ...group, answerType: newType, answers: getDefaultAnswers(newType) });
  };

  return (
    <div className="mb-5">
      {/* - Question - */}
      <div className="tinyMceWidget">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="h4 m-0">{intl.formatMessage(messages.questionSectionTitle, { number: n })}</div>
          {!isOnly && (
            <IconButton
              src={DeleteOutline}
              iconAs={Icon}
              alt={intl.formatMessage(messages.deleteQuestionAltText, { number: n })}
              onClick={onRemove}
              variant="primary"
            />
          )}
        </div>
        <GroupEditor
          id={`cp-q-${group.id}-question`}
          editorType="question"
          content={group.question}
          onUpdate={updateQuestion}
          images={images}
          isLibrary={isLibrary}
          learningContextId={learningContextId}
        />
      </div>

      {/* - Answers - */}
      <div className="mt-4 text-primary-500">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="h4 mb-0">{intl.formatMessage(messages.answersSectionTitle, { number: n })}</div>
          <Form.Group className="mb-0">
            <Form.Control
              as="select"
              value={answerType}
              onChange={(e) => handleAnswerTypeChange(e.target.value)}
              aria-label={intl.formatMessage(messages.answerTypeSelectLabel)}
              style={{ minWidth: '160px' }}
            >
              {Object.entries(ANSWER_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{intl.formatMessage(label)}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
        <div className="small mb-3">
          <FormattedMessage {...ANSWER_TYPE_DESCRIPTIONS[answerType]} />
        </div>

        {/* Rich-text choices: single select and multi-select (TinyMCE per answer) */}
        {isRichChoiceType && (
          <div className="answers-container border border-light-700 rounded py-4 pl-4 pr-3">
            {group.answers.map((ans, ai) => (
              <div
                key={ans.id}
                className="answer-option d-flex flex-row justify-content-between flex-nowrap pb-2 pt-2"
              >
                <div className="mr-1 d-flex">
                  <Checker
                    hasSingleAnswer={hasSingleAnswer}
                    answer={{ id: indexToLetterMap[ai], correct: ans.correct }}
                    setAnswer={({ correct }) => {
                      if (!hasSingleAnswer) {
                        toggleCorrectAnswer(ans.id, correct);
                      } else if (correct) {
                        setSingleCorrectAnswer(ans.id);
                      }
                    }}
                  />
                </div>
                <div className="ml-1 flex-grow-1">
                  <ExpandableTextArea
                    id={`cp-q-${group.id}-answer-${ans.id}`}
                    value={ans.text}
                    setContent={(html) => updateAnswerText(ans.id, html)}
                    placeholder={intl.formatMessage(answerWidgetMessages.answerTextboxPlaceholder)}
                    images={images}
                    isLibrary={isLibrary}
                    learningContextId={learningContextId}
                  />
                </div>
                {group.answers.length > 1 && (
                  <IconButton
                    src={DeleteOutline}
                    iconAs={Icon}
                    alt={intl.formatMessage(answerWidgetMessages.answerDeleteIconAltText)}
                    onClick={() => removeAnswer(ans.id)}
                    variant="primary"
                  />
                )}
              </div>
            ))}
            <Button variant="add" onClick={addAnswer}>
              <FormattedMessage {...answerWidgetMessages.addAnswerButtonText} />
            </Button>
          </div>
        )}

        {/* Dropdown: plain-text options (LMS <option> elements cannot contain HTML) */}
        {isDropdownType && (
          <div className="answers-container border border-light-700 rounded py-4 pl-4 pr-3">
            {group.answers.map((ans, ai) => (
              <div
                key={ans.id}
                className="answer-option d-flex flex-row align-items-center justify-content-between flex-nowrap pb-2 pt-2"
              >
                <div className="mr-1 d-flex">
                  <Checker
                    hasSingleAnswer
                    answer={{ id: indexToLetterMap[ai], correct: ans.correct }}
                    setAnswer={({ correct }) => {
                      if (correct) { setSingleCorrectAnswer(ans.id); }
                    }}
                  />
                </div>
                <div className="ml-1 flex-grow-1">
                  <Form.Control
                    as="textarea"
                    className="answer-option-textarea text-gray-500 small"
                    autoResize
                    rows={1}
                    value={ans.text}
                    onChange={(e) => updateAnswerText(ans.id, e.target.value)}
                    placeholder={intl.formatMessage(answerWidgetMessages.answerTextboxPlaceholder)}
                  />
                </div>
                {group.answers.length > 1 && (
                  <IconButton
                    src={DeleteOutline}
                    iconAs={Icon}
                    alt={intl.formatMessage(answerWidgetMessages.answerDeleteIconAltText)}
                    onClick={() => removeAnswer(ans.id)}
                    variant="primary"
                  />
                )}
              </div>
            ))}
            <Button variant="add" onClick={addAnswer}>
              <FormattedMessage {...answerWidgetMessages.addAnswerButtonText} />
            </Button>
          </div>
        )}

        {/* Numerical input — textarea allows ranges like [1,10) and fractions like 3/2 */}
        {answerType === ANSWER_TYPES.NUMERICAL && (
          <div className="answers-container border border-light-700 rounded py-4 pl-4 pr-3">
            <Form.Group controlId={`cp-q-${group.id}-numerical-answer`} className="mb-0">
              <Form.Label className="small text-gray-500 mb-1">
                <FormattedMessage {...messages.correctAnswerLabel} />
              </Form.Label>
              <Form.Control
                as="textarea"
                className="answer-option-textarea text-gray-500 small"
                autoResize
                rows={1}
                value={group.answers[0]?.text || ''}
                onChange={(e) => updateAnswerText(0, e.target.value)}
                placeholder={intl.formatMessage(answerWidgetMessages.answerTextboxPlaceholder)}
              />
            </Form.Group>
          </div>
        )}

        {/* Text input */}
        {answerType === ANSWER_TYPES.TEXT && (
          <div className="answers-container border border-light-700 rounded py-4 pl-4 pr-3">
            <Form.Group controlId={`cp-q-${group.id}-text-answer`} className="mb-0">
              <Form.Label className="small text-gray-500 mb-1">
                <FormattedMessage {...messages.correctAnswerLabel} />
              </Form.Label>
              <Form.Control
                as="textarea"
                className="answer-option-textarea text-gray-500 small"
                autoResize
                rows={1}
                value={group.answers[0]?.text || ''}
                onChange={(e) => updateAnswerText(0, e.target.value)}
                placeholder={intl.formatMessage(answerWidgetMessages.answerTextboxPlaceholder)}
              />
            </Form.Group>
          </div>
        )}
      </div>

      {/* - Explanation - */}
      <div className="tinyMceWidget mt-4 text-primary-500">
        <div className="h4 mb-3">{intl.formatMessage(messages.explanationSectionTitle, { number: n })}</div>
        <div className="small mb-3">
          <FormattedMessage {...messages.explanationHelperText} />
        </div>
        <GroupEditor
          id={`cp-q-${group.id}-explanation`}
          editorType="solution"
          content={group.explanation}
          onUpdate={updateExplanation}
          images={images}
          isLibrary={isLibrary}
          learningContextId={learningContextId}
        />
      </div>
    </div>
  );
};

QuestionGroup.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    explanation: PropTypes.string.isRequired,
    answerType: PropTypes.string,
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
