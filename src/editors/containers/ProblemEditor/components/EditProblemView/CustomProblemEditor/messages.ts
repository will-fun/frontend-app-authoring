import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // Section titles
  questionSectionTitle: {
    id: 'authoring.problemEditor.customProblem.questionSectionTitle',
    defaultMessage: 'Question {number}',
    description: 'Title above the question editor of a question group, numbered from 1',
  },
  explanationSectionTitle: {
    id: 'authoring.problemEditor.customProblem.explanationSectionTitle',
    defaultMessage: 'Explanation {number}',
    description: 'Title above the explanation editor of a question group, numbered from 1',
  },
  answersSectionTitle: {
    id: 'authoring.problemEditor.customProblem.answersSectionTitle',
    defaultMessage: 'Answers {number}',
    description: 'Title above the answers of a question group, numbered from 1',
  },
  explanationHelperText: {
    id: 'authoring.problemEditor.customProblem.explanationHelperText',
    defaultMessage: 'Write the explanation for the correct answer to this question.',
    description: 'Helper text below the explanation title of a question group',
  },

  // Buttons and labels
  addQuestionButtonText: {
    id: 'authoring.problemEditor.customProblem.addQuestionButtonText',
    defaultMessage: 'Add question',
    description: 'Button text to add another question group to the problem',
  },
  deleteQuestionAltText: {
    id: 'authoring.problemEditor.customProblem.deleteQuestionAltText',
    defaultMessage: 'Delete question {number}',
    description: 'Alt text for the button that deletes a question group',
  },
  answerTypeSelectLabel: {
    id: 'authoring.problemEditor.customProblem.answerTypeSelectLabel',
    defaultMessage: 'Answer type',
    description: 'Accessible label for the dropdown that picks the answer type of a question group',
  },
  correctAnswerLabel: {
    id: 'authoring.problemEditor.customProblem.correctAnswerLabel',
    defaultMessage: 'Correct answer',
    description: 'Label above the single answer field of numerical input and text input questions',
  },

  // Answer type names
  answerTypeSingleSelect: {
    id: 'authoring.problemEditor.customProblem.answerType.singleSelect',
    defaultMessage: 'Single select',
    description: 'Name of the answer type where learners pick one answer from radio buttons',
  },
  answerTypeMultiSelect: {
    id: 'authoring.problemEditor.customProblem.answerType.multiSelect',
    defaultMessage: 'Multi-select',
    description: 'Name of the answer type where learners pick several answers from checkboxes',
  },
  answerTypeDropdown: {
    id: 'authoring.problemEditor.customProblem.answerType.dropdown',
    defaultMessage: 'Dropdown',
    description: 'Name of the answer type where learners pick one option from a dropdown list',
  },
  answerTypeNumericalInput: {
    id: 'authoring.problemEditor.customProblem.answerType.numericalInput',
    defaultMessage: 'Numerical input',
    description: 'Name of the answer type where learners type a number',
  },
  answerTypeTextInput: {
    id: 'authoring.problemEditor.customProblem.answerType.textInput',
    defaultMessage: 'Text input',
    description: 'Name of the answer type where learners type text',
  },

  // Answer type descriptions
  singleSelectDescription: {
    id: 'authoring.problemEditor.customProblem.description.singleSelect',
    defaultMessage: 'Mark the correct answer. Learners must select one answer.',
    description: 'Helper text shown when the answer type of a question group is single select',
  },
  multiSelectDescription: {
    id: 'authoring.problemEditor.customProblem.description.multiSelect',
    defaultMessage: 'Mark every correct answer. Learners can select more than one.',
    description: 'Helper text shown when the answer type of a question group is multi-select',
  },
  dropdownDescription: {
    id: 'authoring.problemEditor.customProblem.description.dropdown',
    defaultMessage: 'Mark the one correct option. Learners pick from a dropdown list, so options are plain text.',
    description: 'Helper text shown when the answer type of a question group is dropdown',
  },
  numericalDescription: {
    id: 'authoring.problemEditor.customProblem.description.numerical',
    defaultMessage: 'Enter the correct answer as a number (42), a fraction (3/2), or a range ([1,10)).',
    description: 'Helper text shown when the answer type of a question group is numerical input',
  },
  textDescription: {
    id: 'authoring.problemEditor.customProblem.description.text',
    defaultMessage: 'Enter the correct answer as text. Capitalization is ignored.',
    description: 'Helper text shown when the answer type of a question group is text input',
  },
});

export default messages;
