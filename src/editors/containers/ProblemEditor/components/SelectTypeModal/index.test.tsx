import {
  fireEvent,
  screen,
  initializeMocks,
} from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import * as hooks from './hooks';
import SelectTypeModal from '.';

describe('SelectTypeModal', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('it can select a basic problem type', async () => {
    const mockClose = jest.fn();
    const mockSelect = jest.fn();
    jest.spyOn(hooks, 'onSelect').mockImplementation(mockSelect);
    // This is a new-style test, unlike most of the old snapshot-based editor tests.
    editorRender(
      <SelectTypeModal onClose={mockClose} />,
    );

    // First we see the menu of problem types:
    expect(await screen.findByRole('button', { name: 'Numerical input' })).toBeInTheDocument();
    // And the "Advanced" types are not listed, nor is there a link to reach them:
    expect(screen.queryByRole('radio', { name: 'Custom JavaScript display and grading' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Advanced problem types' })).not.toBeInTheDocument();

    const numericalInputBtn = await screen.findByRole('button', { name: 'Numerical input' });
    fireEvent.click(numericalInputBtn);

    // Now we save our selection:
    const selectBtn = screen.getByRole('button', { name: 'Select' });
    fireEvent.click(selectBtn);
    expect(mockSelect).toHaveBeenLastCalledWith(expect.objectContaining({ selected: 'numericalresponse' }));
  });

  test('it can select custom problem from the main menu', async () => {
    const mockClose = jest.fn();
    const mockSelect = jest.fn();
    jest.spyOn(hooks, 'onSelect').mockImplementation(mockSelect);
    editorRender(
      <SelectTypeModal onClose={mockClose} />,
    );

    const customProblemBtn = await screen.findByRole('button', { name: 'Custom problem' });
    fireEvent.click(customProblemBtn);

    // Picking it keeps the main menu on screen rather than switching to the advanced menu:
    expect(screen.getByRole('button', { name: 'Numerical input' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Select' }));
    expect(mockSelect).toHaveBeenLastCalledWith(expect.objectContaining({ selected: 'customproblem' }));
  });

  test('it still opens the advanced menu when asked for directly', async () => {
    const mockClose = jest.fn();
    editorRender(
      <SelectTypeModal onClose={mockClose} openAdvanced />,
    );

    await screen.findByRole('radio', { name: 'Custom JavaScript display and grading' });
    expect(screen.queryByRole('button', { name: 'Numerical input' })).not.toBeInTheDocument();

    // Going back returns to the main menu:
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByRole('button', { name: 'Numerical input' })).toBeInTheDocument();
  });
});
