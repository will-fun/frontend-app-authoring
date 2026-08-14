import React from 'react';

import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import {
  render,
  screen,
  fireEvent,
  initializeMocks,
} from '../../../../../../testUtils';
import ProblemTypeSelect from './ProblemTypeSelect';

describe('ProblemTypeSelect', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the component with the selected element checked', () => {
    render(<ProblemTypeSelect setSelected={jest.fn()} selected={ProblemTypeKeys.SINGLESELECT} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const radioSingle = screen.getByDisplayValue('multiplechoiceresponse');
    expect(radioSingle).toBeChecked();
  });

  it('does not render advanced element', () => {
    render(<ProblemTypeSelect setSelected={jest.fn()} selected={ProblemTypeKeys.MULTISELECT} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.queryByText('advanced')).not.toBeInTheDocument();
  });

  it('should call setSelected with correct value when clicking one option', () => {
    const mockSetSelected = jest.fn();
    render(<ProblemTypeSelect setSelected={mockSetSelected} selected={ProblemTypeKeys.NUMERIC} />);
    const multiSelectOption = screen.getByRole('button', { name: 'Multi-select' });
    fireEvent.click(multiSelectOption);
    expect(mockSetSelected).toHaveBeenCalledWith('choiceresponse');
  });

  it('does not offer a link to the advanced problem types', () => {
    render(<ProblemTypeSelect setSelected={jest.fn()} selected={ProblemTypeKeys.MULTISELECT} />);
    expect(screen.queryByRole('button', { name: 'Advanced problem types' })).not.toBeInTheDocument();
  });

  it('lists custom problem after text input', () => {
    render(<ProblemTypeSelect setSelected={jest.fn()} selected={ProblemTypeKeys.SINGLESELECT} />);
    const optionNames = screen.getAllByRole('button').map((option) => option.textContent);
    expect(optionNames).toEqual([
      'Single select',
      'Multi-select',
      'Dropdown',
      'Numerical input',
      'Text input',
      'Custom problem',
    ]);
  });

  it('should call setSelected with customproblem when clicking custom problem', () => {
    const mockSetSelected = jest.fn();
    render(<ProblemTypeSelect setSelected={mockSetSelected} selected={ProblemTypeKeys.SINGLESELECT} />);
    fireEvent.click(screen.getByRole('button', { name: 'Custom problem' }));
    expect(mockSetSelected).toHaveBeenCalledWith('customproblem');
  });
});
