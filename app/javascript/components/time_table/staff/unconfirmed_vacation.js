import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { NavLink } from 'react-router-dom';
import * as Api from '../../shared/api';
import {
  Errors, Warnings, Interactions, VacationPeriod,
} from './shared_functionalities';

function UnconfirmedVacation(props) {
  const {
    propsVacation,
    removeFromInteractedVacations,
    addToInteractedVacations,
    availableVacationDays,
    setUserVacationDays,
  } = props;
  const [errors, setErrors] = useState([]);
  const [vacation, setVacation] = useState(propsVacation);
  const [warnings, setWarnings] = useState([]);
  const vacationPotential = vacation.available_vacation_days - vacation.business_days_count;
  const cardClass = (vacationPotential < 0 && currentUser.isStaffManager()) ? 'warning' : vacation.status;

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
      setUserVacationDays(response.data.user_id, response.data.available_vacation_days);
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
      setUserVacationDays(response.data.vacation.user_id, response.data.user_available_vacation_days);
      if (!_.isEmpty(response.data.warnings)) {
        setWarnings(response.data.warnings);
        setVacation({
          ...response.data.vacation,
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
          {_.isEmpty(warnings) ? undefined : (
            <button className="bt-vacation ok ml-4" type="button" onClick={() => addToInteractedVacations(vacation, 'accept')}>
              <span className="bt-txt">{I18n.t('apps.staff.ok')}</span>
            </button>
          )}
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

  useEffect(() => {
    setErrors([]);
  }, [vacation.vacation_sub_type]);

  function VacationPotential() {
    if (vacationPotential >= 0 || !currentUser.isStaffManager()) { return null; }
    return (
      <div>
        {I18n.t('apps.staff.available_vacation_days_after_accepting')}
        :
        {` ${vacationPotential}`}
      </div>
    );
  }

  if (vacation.self_declined || (vacation.status === 'declined' && vacation.interacted === false)) { return null; }

  return (
    <div className={`card p-0 unconfirmed-vacation ${cardClass}`}>
      <div className="card-header">
        <Errors errors={errors} />
        <Warnings warnings={warnings} />
        <div className="vacation-header">
          <div className="user-full-name">
            {vacation.full_name}
            { currentUser.isStaffManager() && (
              <NavLink to={`/timesheet?user_id=${vacation.user_id}`}>
                <i className="icon calendar" />
              </NavLink>
            )}
          </div>
          <VacationPeriod
            vacation={vacation}
            setVacation={setVacation}
            setErrors={setErrors}
          />
        </div>
      </div>
      <div className="card-body">
        <div className="vacation-description">
          {vacation.description}
        </div>
      </div>
      <div className="card-footer">
        <div className="vacation-footer">
          <VacationType />
          <Buttons />
        </div>
        <Interactions vacation={vacation} />
        { window.currentUser.staff_manager && (
          <div className="available_vacation_days">
            {I18n.t('apps.staff.available_vacation_days')}
            :
            <span className="vacation-days">
              {` ${availableVacationDays}`}
            </span>
            <VacationPotential />
          </div>
        )}
      </div>
    </div>
  );
}

export default UnconfirmedVacation;
