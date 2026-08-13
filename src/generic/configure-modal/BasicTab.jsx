import moment from 'moment';
import PropTypes from 'prop-types';
import { Stack, Form } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { DatepickerControl, DATEPICKER_TYPES } from '../datepicker-control';
import messages from './messages';

// Studio's release/due date fields are stored and sent to the API as UTC. The picker below
// only knows how to display/edit "local" digits (see convertToDateFromString's bug workaround
// comment), so we shift the digits by a fixed +7h (Asia/Jakarta) offset for display and shift
// back to real UTC before it reaches formik/the API.
const GMT7_OFFSET_HOURS = 7;
const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss[Z]';

const toGmt7DateString = (utcDateStr) => (
  utcDateStr
    ? moment.utc(utcDateStr).add(GMT7_OFFSET_HOURS, 'hours').format(DATE_TIME_FORMAT)
    : utcDateStr
);

const fromGmt7DateString = (gmt7DateStr) => (
  gmt7DateStr
    ? moment.utc(gmt7DateStr.substring(0, 19)).subtract(GMT7_OFFSET_HOURS, 'hours').format(DATE_TIME_FORMAT)
    : gmt7DateStr
);

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

  const createOptions = () => courseGraders.map((option) => (
    <option key={option} value={option}> {option} </option>
  ));

  return (
    <>
      {!isSelfPaced && (
        <>
          <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.releaseDateAndTime} /></h5>
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
      {
        isSubsection && (
          <div>
            <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.grading} /></h5>
            <hr />
            <Form.Group>
              <Form.Label><FormattedMessage {...messages.gradeAs} /></Form.Label>
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
        )
      }
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
