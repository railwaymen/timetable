import React, { useState, useEffect } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import useFormHandler from '@hooks/use_form_handler';
import { defaultDatePickerProps } from '@components/shared/helpers';
import PropTypes from 'prop-types';
import { makeGetRequest, makePostRequest } from '../../shared/api';

const NewEntryForm = (props) => {
  const { handleNewEntry, userId } = props;

  const defaultRemoteWork = {
    user_id: userId,
    starts_at: moment().set({ hour: 9, minute: 0 }),
    ends_at: moment().set({ hour: 17, minute: 0 }),
  };

  const [remoteWork, setRemoteWork, onChange] = useFormHandler(defaultRemoteWork);
  const [users, setUsers] = useState([]);

  function getUsers() {
    makeGetRequest({ url: '/api/users' })
      .then((response) => {
        if (response.status === 200) {
          setUsers(response.data);
        }
      });
  }

  function onDateChange(date, name) {
    setRemoteWork({ ...remoteWork, [name]: date });
  }

  function onSubmit(e) {
    e.preventDefault();

    makePostRequest({ url: '/api/remote_works', body: { remote_work: remoteWork } })
      .then(() => handleNewEntry(remoteWork.user_id))
      .catch(() => {});
  }

  useEffect(() => {
    if (!currentUser.admin) return;
    getUsers();
  }, []);

  useEffect(() => {
    setRemoteWork({ ...remoteWork, user_id: userId });
  }, [userId]);

  const { errors = {} } = remoteWork;

  return (
    <div id="content" className="new-remote-work">
      <form className="row" onSubmit={onSubmit}>
        <div className="col-12 col-md-6">
          <div className="row calendar-row">
            <div className="col-md-6 form-group">
              {errors.startsAt && (
                <div className="error-description">{errors.startsAt.join(', ')}</div>
              )}
              <DatePicker
                {...defaultDatePickerProps}
                dateFormat="YYYY-MM-DD HH:mm"
                timeFormat="HH:mm"
                showTimeSelect
                timeIntervals={15}
                className={`${errors.starts_at ? 'error' : ''} form-control`}
                selected={remoteWork.starts_at}
                name="starts_at"
                placeholderText={I18n.t('common.from')}
                onChange={(date) => onDateChange(date, 'starts_at')}
              />
            </div>
            <div className="col-md-6 form-group">
              {errors.endsAt && (
                <div className="error-description">{errors.endsAt.join(', ')}</div>
              )}
              <DatePicker
                {...defaultDatePickerProps}
                dateFormat="YYYY-MM-DD HH:mm"
                timeFormat="HH:mm"
                showTimeSelect
                timeIntervals={15}
                className={`${errors.ends_at ? 'error' : ''} form-control`}
                selected={remoteWork.ends_at}
                name="ends_at"
                placeholderText={I18n.t('common.to')}
                onChange={(date) => onDateChange(date, 'ends_at')}
              />
            </div>
          </div>
          {currentUser.admin && (
            <div className="row calendar-row">
              <div className="form-group">
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
        <div className="col-12 col-md-6">
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
  refreshList: PropTypes.func,
};

export default NewEntryForm;
