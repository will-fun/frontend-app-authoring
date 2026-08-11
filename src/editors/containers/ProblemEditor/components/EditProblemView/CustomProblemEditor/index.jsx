import React, {
  useEffect, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import { actions, selectors } from '../../../../../data/redux';
import {
  ANSWER_TYPES, buildOLX, createEmptyGroup, parseGroupsFromOLX,
} from './utils';
import QuestionGroup from './QuestionGroup';
import messages from './messages';

const CustomProblemEditor = () => {
  const dispatch = useDispatch();
  const problemState = useSelector(selectors.problem.completeState);
  const rawOLX = problemState?.rawOLX;

  const [groups, setGroups] = useState(() => parseGroupsFromOLX(rawOLX));
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const olx = buildOLX(groups);
    dispatch(actions.problem.updateField({ rawOLX: olx, isDirty: true }));
  }, [groups]);

  const updateGroup = (idx, updated) => {
    setGroups((prev) => prev.map((g, i) => (i === idx ? updated : g)));
  };

  const removeGroup = (idx) => {
    setGroups((prev) => prev.filter((_, i) => i !== idx));
  };

  const addGroup = () => {
    const nextId = groups.length > 0 ? Math.max(...groups.map((g) => g.id)) + 1 : 0;
    setGroups((prev) => [...prev, createEmptyGroup(nextId, ANSWER_TYPES.SINGLECHOICE)]);
  };

  return (
    <div className="p-3">
      {groups.map((group, idx) => (
        <QuestionGroup
          key={group.id}
          group={group}
          index={idx}
          onChange={(updated) => updateGroup(idx, updated)}
          onRemove={() => removeGroup(idx)}
          isOnly={groups.length === 1}
        />
      ))}
      <Button
        variant="primary"
        iconBefore={Add}
        onClick={addGroup}
        className="mt-2"
      >
        <FormattedMessage {...messages.addQuestionButtonText} />
      </Button>
    </div>
  );
};

export default CustomProblemEditor;
