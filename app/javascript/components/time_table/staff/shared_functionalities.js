import React, { useState } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import { defaultDatePickerProps } from '../../shared/helpers';
import { makePostRequest } from '../../shared/api';

export function Errors({ errors }) {
  if (errors.length <= 0) { return null; }
  const errorList = [];
  errors.forEach((error) => {
    Object.keys(error).forEach((err) => {
      errorList.push(<div className={err} key={err}>{error[err]}</div>);
    });
  });

  return (
    <div className="row vacation-errors error-tooltip">
      {errorList}
    </div>
  );
}

export function Warnings({ warnings }) {
  if (warnings.length <= 0) { return null; }
  const warningsList = [];
  warnings.forEach((warning) => {
    Object.keys(warning).forEach((war) => {
      warningsList.push(<div className={war} key={war}>{warning[war]}</div>);
    });
  });

  return (
    <div className="row vacation-errors error-tooltip">
      {warningsList}
    </div>
  );
}

export function Interactions({ vacation }) {
  const approvers = [];
  const decliners = [];
  const vacationApprovers = vacation.approvers ? vacation.approvers.split(',').filter(Boolean) : [];
  const vacationDecliners = vacation.decliners ? vacation.decliners.split(',').filter(Boolean) : [];
  if (vacationApprovers) {
    for (let i = 0; i < vacationApprovers.length; i += 1) {
      approvers.push(
        <div className="approver" key={i}>
          {I18n.t('apps.staff.approved_by')}
          <span className="interactor-name">
            {` ${vacationApprovers[i]}`}
          </span>
        </div>,
      );
    }
  }
  if (vacationDecliners) {
    for (let i = 0; i < vacationDecliners.length; i += 1) {
      decliners.push(
        <div className="decliner" key={i}>
          {I18n.t('apps.staff.declined_by')}
          <span className="interactor-name">
            {` ${vacationDecliners[i]}`}
          </span>
        </div>,
      );
    }
  }
  return (
    <div className="interactions-list">
      {approvers}
      {decliners}
    </div>
  );
}

export function VacationPeriod({ vacation, setVacation, setErrors }) {
  const [editing, setEditing] = useState(false);
  const [startDate, setStartDate] = useState(vacation.start_date);
  const [endDate, setEndDate] = useState(vacation.end_date);

  function onSaveClick() {
    makePostRequest({
      url: `/api/vacations/${vacation.id}/update_dates`,
      body: { vacation: { start_date: startDate, end_date: endDate } },
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { return setErrors(response.data.errors); }
      setVacation(response.data.vacation);
      return setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="vacation-time-period d-flex">
        <DatePicker
          {...defaultDatePickerProps}
          name="start_date"
          className="form-control text-center nm-100"
          selected={moment(startDate)}
          value={moment(startDate).format('DD/MM/YYYY')}
          format="DD/MM/YYYYs"
          dateFormat="DD/MM/YYYY"
          onChange={(date) => setStartDate((date ? date.format('YYYY-MM-DD') : null))}
          onSelect={(date) => setStartDate((date ? date.format('YYYY-MM-DD') : null))}
        />
        <DatePicker
          {...defaultDatePickerProps}
          name="end_date"
          className="form-control text-center nm-100"
          selected={moment(endDate)}
          value={moment(endDate).format('DD/MM/YYYY')}
          format="DD/MM/YYYYs"
          dateFormat="DD/MM/YYYY"
          onChange={(date) => setEndDate((date ? date.format('YYYY-MM-DD') : null))}
          onSelect={(date) => setEndDate((date ? date.format('YYYY-MM-DD') : null))}
        />
        <div className="ml-2 mt-auto mb-auto">
          <button className="bt-vacation btn-sm save" type="button" onClick={onSaveClick}>
            <span className="bt-txt">{I18n.t('common.save')}</span>
          </button>
          <button className="bt-vacation btn-sm cancel mr-2" type="button" onClick={() => setEditing(false)}>
            <span className="bt-txt">{I18n.t('common.cancel')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vacation-time-period">
      {moment(vacation.start_date).format('DD/MM/YYYY')}
      -
      {moment(vacation.end_date).format('DD/MM/YYYY')}
      {(vacation.status === 'unconfirmed' || vacation.status === 'approved')
        && <i className="icon pencil ml-2" style={{ cursor: 'pointer' }} onClick={() => setEditing(true)} />}
    </div>
  );
}
