import React, { useState, useEffect } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import useFormHandler from '@hooks/use_form_handler';
import { defaultDatePickerProps } from '@components/shared/helpers';
import PropTypes from 'prop-types';
import ErrorTooltip from '@components/shared/error_tooltip';
import translateErrors from '@components/shared/translate_errors';
import { makeGetRequest, makePostRequest } from '../../shared/api';

const NewEntryForm = (props) => {
  const { handleNewEntry, userId } = props;

  const defaultRemoteWork = {
    user_id: userId,
    starts_at: moment().set({ hour: 9, minute: 0, second: 0 }),
    ends_at: moment().set({ hour: 17, minute: 0, second: 0 }),
  };

  const [remoteWork, setRemoteWork, onChange] = useFormHandler(defaultRemoteWork);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});

  function getUsers() {
    makeGetRequest({ url: '/api/users' })
      .then((response) => setUsers(response.data));
  }

  function onDateChange(date, name) {
    setRemoteWork({ ...remoteWork, [name]: date });
  }

  function onSubmit(e) {
    e.preventDefault();

    makePostRequest({ url: '/api/remote_works', body: { remote_work: remoteWork } })
      .then(() => {
        handleNewEntry(remoteWork.user_id);
        setErrors({});
      }).catch((response) => {
        setErrors(translateErrors('remote_work', response.errors));
      });
  }

  useEffect(() => {
    if (!currentUser.admin) return;
    getUsers();
  }, []);

  useEffect(() => {
    setRemoteWork({ ...remoteWork, user_id: userId });
  }, [userId]);

  return (
    <div id="content" className="new-remote-work">
      <form className="row" onSubmit={onSubmit}>
        <div className="col-12 col-md-8">
          <div className="row calendar-row">
            <div className="col-md-6 form-group">
              {errors.startsAt && <ErrorTooltip errors={errors.startsAt} />}
              <DatePicker
                {...defaultDatePickerProps}
                dateFormat="YYYY-MM-DD HH:mm"
                timeFormat="HH:mm"
                showTimeSelect
                timeIntervals={15}
                className={`${errors.startsAt ? 'error' : ''} form-control`}
                selected={remoteWork.starts_at}
                name="starts_at"
                placeholderText={I18n.t('common.from')}
                onChange={(date) => onDateChange(date, 'starts_at')}
              />
            </div>
            <div className="col-md-6 form-group">
              {errors.endsAt && <ErrorTooltip errors={errors.endsAt} />}
              <DatePicker
                {...defaultDatePickerProps}
                dateFormat="YYYY-MM-DD HH:mm"
                timeFormat="HH:mm"
                showTimeSelect
                timeIntervals={15}
                className={`${errors.endsAt ? 'error' : ''} form-control`}
                selected={remoteWork.ends_at}
                name="ends_at"
                placeholderText={I18n.t('common.to')}
                onChange={(date) => onDateChange(date, 'ends_at')}
              />
            </div>
          </div>
          {currentUser.admin && (
            <div className="row calendar-row">
              <div className="col-md-6 form-group">
                <select className="form-control" name="user_id" value={remoteWork.user_id} onChange={onChange}>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {currentUser.fullName.apply(user)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="col-12 col-md-4">
          <div className="form-group">
            <textarea
              className="form-control"
              name="note"
              placeholder={I18n.t('apps.accounting_periods.note')}
              onChange={onChange}
              value={remoteWork.note || ''}
            />
          </div>
        </div>
        <div className="form-actions text-right">
          <button className="bt bt-big bt-main bt-submit" type="submit">
            <span className="bt-txt">{I18n.t('common.save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

NewEntryForm.propTypes = {
  handleNewEntry: PropTypes.func,
  userId: PropTypes.number,
};

export default NewEntryForm;
