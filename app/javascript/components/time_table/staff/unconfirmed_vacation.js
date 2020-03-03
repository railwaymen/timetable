import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { NavLink } from 'react-router-dom';
import * as Api from '../../shared/api';

function UnconfirmedVacation(props) {
  const { propsVacation, removeFromInteractedVacations, addToInteractedVacations } = props;
  const [errors, setErrors] = useState([]);
  const [vacation, setVacation] = useState(propsVacation);
  const [warnings, setWarnings] = useState([]);

  function Errors() {
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

  function Warnings() {
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

  function VacationType() {
    if (vacation.vacation_type === 'others') {
      const vacationSubType = vacation.vacation_sub_type ? vacation.vacation_sub_type : '';
      return (
        <div className="vacation-sub-type">
          <select
            className="form-control"
            name="vacationSubType"
            value={vacationSubType}
            disabled={vacation.status === 'accepted'}
            onChange={(e) => setVacation({ ...vacation, vacation_sub_type: e.target.value })}
          >
            <option value="">{I18n.t('apps.staff.choose')}</option>
            <option value="paternity">{I18n.t('common.paternity')}</option>
            <option value="parental">{I18n.t('common.parental')}</option>
            <option value="upbringing">{I18n.t('common.upbringing')}</option>
            <option value="unpaid">{I18n.t('common.unpaid')}</option>
            <option value="rehabilitation">{I18n.t('common.rehabilitation')}</option>
            <option value="illness">{I18n.t('common.illness')}</option>
            <option value="care">{I18n.t('common.care_definition')}</option>
          </select>
        </div>
      );
    }
    return (
      <div className="vacation-type">
        <span>
          {I18n.t(`common.${vacation.vacation_type}`)}
        </span>
      </div>
    );
  }

  function updateVacation(vacationId) {
    Api.makeGetRequest({
      url: `/api/vacations/${vacationId}`,
    }).then((response) => {
      setVacation(response.data);
    });
  }

  function onUndoneClick() {
    setWarnings([]);
    Api.makePutRequest({
      url: `/api/vacations/${vacation.id}/undone`,
    }).then(() => {
      updateVacation(vacation.id);
    });
  }

  function onAcceptClick() {
    const vacationSubType = vacation.vacation_sub_type ? vacation.vacation_sub_type : '';
    Api.makePostRequest({
      url: `/api/vacations/${vacation.id}/approve`,
      body: { vacation: { vacation_sub_type: vacationSubType } },
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { setErrors(response.data.errors); return; }
      if (!_.isEmpty(response.data.warnings)) {
        setWarnings(response.data.warnings);
        setVacation({
          ...response.data.vacation,
          available_vacation_days: response.data.user_available_vacation_days,
          interacted: true,
        });
        return;
      }
      if (response.data.vacation.status === 'accepted') { addToInteractedVacations(response.data.vacation, 'accept'); }
      if (response.data.previous_status === 'declined') { removeFromInteractedVacations(response.data.vacation, 'accept'); }
      if (_.includes(['unconfirmed', 'approved'], response.data.vacation.status)) { updateVacation(vacation.id); }
    });
  }

  function onDeclineClick() {
    Api.makePostRequest({
      url: `/api/vacations/${vacation.id}/decline`,
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { setErrors(response.data.errors); return; }
      if (_.includes(['accepted', 'approved'], response.data.previous_status)) { removeFromInteractedVacations(response.data.vacation, 'decline'); }
      addToInteractedVacations(response.data.vacation, 'decline');
      if (!window.currentUser.staff_manager) { updateVacation(vacation.id); }
    });
  }

  function Buttons() {
    if (vacation.interacted) {
      return (
        <div className="vacation-buttons">
          <button className="bt-vacation undone" type="button" onClick={onUndoneClick}>
            <span className="bt-txt">{I18n.t('apps.staff.undone')}</span>
          </button>
        </div>
      );
    }
    return (
      <div className="vacation-buttons">
        <button className="bt-vacation accept" type="button" onClick={onAcceptClick}>
          <span className="bt-txt">{I18n.t('apps.staff.accept')}</span>
        </button>
        <button className="bt-vacation decline" type="button" onClick={onDeclineClick}>
          <span className="bt-txt">{I18n.t('apps.staff.decline')}</span>
        </button>
      </div>
    );
  }

  function Interactions() {
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

  useEffect(() => {
    setErrors([]);
  }, [vacation.vacation_sub_type]);

  if (vacation.status === 'declined' && vacation.interacted === false) { return null; }

  return (
    <div className={`unconfirmed-vacation ${vacation.status}`}>
      <Errors />
      <Warnings />
      <div className="vacation-header">
        <div className="user-full-name">
          {vacation.full_name}
          { window.currentUser.staff_manager && (
            <NavLink to={`/timesheet?user_id=${vacation.user_id}`}>
              <i className="icon calendar" />
            </NavLink>
          )}
        </div>
        <div className="vacation-time-period">
          {moment(vacation.start_date).format('DD/MM/YYYY')}
          -
          {moment(vacation.end_date).format('DD/MM/YYYY')}
        </div>
      </div>
      <div className="vacation-description">
        {vacation.description}
      </div>
      <div className="vacation-footer">
        <VacationType />
        <Buttons />
      </div>
      <Interactions />
      { window.currentUser.staff_manager && (
        <div className="available_vacation_days">
          {I18n.t('apps.staff.available_vacation_days')}
          :
          <span className="vacation-days">
            {` ${vacation.available_vacation_days}`}
          </span>
        </div>
      )}
    </div>
  );
}

export default UnconfirmedVacation;
