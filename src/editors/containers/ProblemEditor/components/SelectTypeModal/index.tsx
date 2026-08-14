import React from 'react';

import { Row, Stack } from '@openedx/paragon';

import {
  AdvancedProblemType,
  AdvanceProblemKeys,
  isAdvancedProblemType,
  ProblemType,
  ProblemTypeKeys,
} from '@src/editors/data/constants/problem';
import ProblemTypeSelect from './content/ProblemTypeSelect';
import Preview from './content/Preview';
import AdvanceTypeSelect from './content/AdvanceTypeSelect';
import SelectTypeWrapper from './SelectTypeWrapper';
import * as hooks from './hooks';

interface Props {
  onClose: (() => void) | null;
  openAdvanced?: boolean;
}

const SelectTypeModal: React.FC<Props> = ({
  onClose,
  openAdvanced = false,
}) => {
  const [selected, setSelected] = React.useState<ProblemType | AdvancedProblemType>(
    openAdvanced ? AdvanceProblemKeys.BLANK : ProblemTypeKeys.SINGLESELECT,
  );
  hooks.useArrowNav(selected, setSelected);

  // Custom problem is an advanced type internally, but it is picked from the main list
  // alongside the built-in types rather than from the advanced menu.
  const showAdvancedMenu = isAdvancedProblemType(selected) && selected !== AdvanceProblemKeys.CUSTOMPROBLEM;

  return (
    <SelectTypeWrapper onClose={onClose} selected={selected}>
      <Row className="justify-content-center">
        {showAdvancedMenu ?
          <AdvanceTypeSelect selected={selected} setSelected={setSelected} /> :
          (
            <Stack direction="horizontal" gap={4} className="flex-wrap mb-6">
              <ProblemTypeSelect selected={selected} setSelected={setSelected} />
              <Preview problemType={selected} />
            </Stack>
          )}
      </Row>
    </SelectTypeWrapper>
  );
};

export default SelectTypeModal;
