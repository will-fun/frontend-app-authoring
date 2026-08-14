import PropTypes from 'prop-types';
import moment from 'moment';
import { Stack, Form } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { DatepickerControl, DATEPICKER_TYPES } from '../datepicker-control';
import { DATE_TIME_FORMAT } from '../../constants';
import messages from './messages';

const GMT7_OFFSET_HOURS = 7;

// Studio stores/sends release & due dates as UTC, but react-datepicker only knows how to
// display/edit local wall-clock digits. Shift the digit string by +7h (GMT+7) before handing
// it to the picker, and shift it back on save, so the picker always shows GMT+7 regardless of
// the viewer's own machine timezone.
const toGmt7DateString = (utcDateStr) => {
  if (!utcDateStr) {
    return utcDateStr;
  }
  return moment.utc(String(utcDateStr).substring(0, 19)).add(GMT7_OFFSET_HOURS, 'hours').format('YYYY-MM-DDTHH:mm:ss');
};

const fromGmt7DateString = (gmt7DateStr) => {
  if (!gmt7DateStr) {
    return gmt7DateStr;
  }
  return moment.utc(String(gmt7DateStr).substring(0, 19)).subtract(GMT7_OFFSET_HOURS, 'hours').format(DATE_TIME_FORMAT);
};

const BasicTab = ({
  values,
  setFieldValue,
  courseGraders,
  isSubsection,
  isSelfPaced,
}) => {
  const intl = useIntl();

  const {
    releaseDate,
    graderType,
    dueDate,
  } = values;

  const onChangeGraderType = (e) => setFieldValue('graderType', e.target.value);

  const createOptions = () => courseGraders.map((option) => <option key={option} value={option}>{option}</option>);

  return (
    <>
      {!isSelfPaced && (
        <>
          <h5 className="mt-4 text-gray-700">
            <FormattedMessage {...messages.releaseDateAndTime} />
          </h5>
          <hr />
          <div data-testid="release-date-stack">
            <Stack className="mt-3" direction="horizontal" gap={5}>
              <DatepickerControl
                type={DATEPICKER_TYPES.date}
                value={toGmt7DateString(releaseDate)}
                label={intl.formatMessage(messages.releaseDate)}
                controlName="state-date"
                onChange={(val) => setFieldValue('releaseDate', fromGmt7DateString(val))}
              />
              <DatepickerControl
                type={DATEPICKER_TYPES.time}
                value={toGmt7DateString(releaseDate)}
                label={intl.formatMessage(messages.releaseTimeUTC)}
                controlName="start-time"
                onChange={(val) => setFieldValue('releaseDate', fromGmt7DateString(val))}
              />
            </Stack>
          </div>
        </>
      )}
      {isSubsection && (
        <div>
          <h5 className="mt-4 text-gray-700">
            <FormattedMessage {...messages.grading} />
          </h5>
          <hr />
          <Form.Group>
            <Form.Label>
              <FormattedMessage {...messages.gradeAs} />
            </Form.Label>
            <Form.Control
              as="select"
              defaultValue={graderType}
              onChange={onChangeGraderType}
              data-testid="grader-type-select"
            >
              <option key="notgraded" value="notgraded">
                {intl.formatMessage(messages.notGradedTypeOption)}
              </option>
              {createOptions()}
            </Form.Control>
          </Form.Group>
          {!isSelfPaced && (
            <div data-testid="due-date-stack">
              <Stack className="mt-3" direction="horizontal" gap={5}>
                <DatepickerControl
                  type={DATEPICKER_TYPES.date}
                  value={toGmt7DateString(dueDate)}
                  label={intl.formatMessage(messages.dueDate)}
                  controlName="state-date"
                  onChange={(val) => setFieldValue('dueDate', fromGmt7DateString(val))}
                  data-testid="due-date-picker"
                />
                <DatepickerControl
                  type={DATEPICKER_TYPES.time}
                  value={toGmt7DateString(dueDate)}
                  label={intl.formatMessage(messages.dueTimeUTC)}
                  controlName="start-time"
                  onChange={(val) => setFieldValue('dueDate', fromGmt7DateString(val))}
                />
              </Stack>
            </div>
          )}
        </div>
      )}
    </>
  );
};

BasicTab.propTypes = {
  isSubsection: PropTypes.bool.isRequired,
  values: PropTypes.shape({
    releaseDate: PropTypes.string.isRequired,
    graderType: PropTypes.string.isRequired,
    dueDate: PropTypes.string,
  }).isRequired,
  courseGraders: PropTypes.arrayOf(PropTypes.string).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  isSelfPaced: PropTypes.bool.isRequired,
};

export default BasicTab;
