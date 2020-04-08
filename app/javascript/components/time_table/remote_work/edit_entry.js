import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import useFormHandler from '@hooks/use_form_handler';
import { defaultDatePickerProps } from '@components/shared/helpers';

function EditEntry(props) {
  const { work, updateRemoteWork } = props;
  const refWork = useRef(work);

  const defaultRemoteWork = {
    ...work,
    date: moment(work.starts_at),
    starts_at_hours: moment(work.starts_at).format('HH:mm'),
    ends_at_hours: moment(work.ends_at).format('HH:mm'),
  };

  const [remoteWork, setRemoteWork, onChange] = useFormHandler(defaultRemoteWork);

  function onDateChange(date) {
    setRemoteWork({ ...remoteWork, date });
  }

  function recountTime() {
    setRemoteWork({
      ...remoteWork,
      starts_at_hours: moment(remoteWork.starts_at_hours, 'HH:mm').format('HH:mm'),
      ends_at_hours: moment(remoteWork.ends_at_hours, 'HH:mm').format('HH:mm'),
    });
  }

  function prepareToSave(rw) {
    const { date, starts_at_hours, ends_at_hours } = rw;
    const newRemoteWork = {
      ...rw,
      starts_at: moment(`${date.format('DD/MM/YYYY')} ${starts_at_hours}`, 'DD/MM/YYYY HH:mm'),
      ends_at: moment(`${date.format('DD/MM/YYYY')} ${ends_at_hours}`, 'DD/MM/YYYY HH:mm'),
    };
    return newRemoteWork;
  }

  // update refWork for cleanup
  useEffect(() => {
    refWork.current = remoteWork;
  }, [remoteWork]);

  // on cleanup: update remote work
  useEffect(() => () => {
    const newRemoteWork = prepareToSave(refWork.current);
    updateRemoteWork(newRemoteWork);
  }, []);

  return (
    <tr>
      <td colSpan="6" className="switch-edition">
        <form>
          <textarea
            name="note"
            placeholder={I18n.t('apps.accounting_periods.note')}
            onChange={onChange}
            value={remoteWork.note || ''}
          />
          <DatePicker
            {...defaultDatePickerProps}
            dateFormat="YYYY-MM-DD"
            className="form-control"
            selected={remoteWork.date}
            name="date"
            placeholderText={I18n.t('common.date')}
            onChange={onDateChange}
            onSelect={onDateChange}
          />
          <input
            className="start-input"
            type="text"
            name="starts_at_hours"
            value={remoteWork.starts_at_hours}
            onChange={onChange}
            onBlur={recountTime}
          />
          <span className="time-divider">-</span>
          <input
            className="end-input"
            type="text"
            name="ends_at_hours"
            value={remoteWork.ends_at_hours}
            onChange={onChange}
            onBlur={recountTime}
          />
        </form>
      </td>
    </tr>
  );
}

EditEntry.propTypes = {
  work: PropTypes.shape({
    starts_at: PropTypes.string,
    ends_at: PropTypes.string,
    duration: PropTypes.number,
    note: PropTypes.string,
  }),
  updateRemoteWork: PropTypes.func,
};

export default EditEntry;
