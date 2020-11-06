import React, { useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { NavLink } from 'react-router-dom';
import * as Api from '../../shared/api';
import { Errors, Warnings, Interactions } from './shared_functionalities';

function InteractedVacation(props) {
  const {
    propsVacation,
    getVacations,
    removeFromInteractedVacations,
    addToInteractedVacations,
    setUserVacationDays,
  } = props;
  const [state, setState] = useState({ vacation: propsVacation, folded: true, fetched: false });
  const { vacation, folded, fetched } = state;
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  function onVacationClick(e) {
    if ($(e.target).closest('.vacation-buttons').length || !window.currentUser.staff_manager) { return; }

    if (folded && !fetched) {
      Api.makeGetRequest({
        url: `/api/vacations/${vacation.id}`,
      }).then((response) => {
        setState({
          vacation: response.data,
          folded: false,
          fetched: true,
        });
      });
    } else {
      setState({ ...state, folded: !state.folded });
    }
  }

  function FoldedVacation() {
    return (
      <div className={`accepted-or-declined-vacation folded ${vacation.status}`} onClick={onVacationClick}>
        <div className="vacation-header folded">
          <div className="user-full-name">
            {vacation.full_name}
          </div>
          <div className="simple-vacation-type">
            {I18n.t(`common.${vacation.vacation_type}`)}
          </div>
          <div className="vacation-time-period folded">
            {moment(vacation.start_date).format('DD/MM/YYYY')}
            -
            {moment(vacation.end_date).format('DD/MM/YYYY')}
          </div>
        </div>
      </div>
    );
  }

  function VacationType() {
    const vacationSubType = vacation.vacation_sub_type ? vacation.vacation_sub_type : '';
    if (vacation.vacation_type === 'others' && window.currentUser.staff_manager) {
      return (
        <div className="vacation-sub-type">
          <select className="form-control" name="vacationSubType" value={vacationSubType} disabled>
            <option value="">{I18n.t('apps.staff.choose')}</option>
            <option value="paternity">{I18n.t('common.paternity')}</option>
            <option value="parental">{I18n.t('common.parental')}</option>
            <option value="upbringing">{I18n.t('common.upbringing')}</option>
            <option value="unpaid">{I18n.t('common.unpaid')}</option>
            <option value="overtime">{I18n.t('common.overtime')}</option>
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
      setState({ ...state, vacation: response.data });
    });
  }

  function onUndoneClick() {
    setWarnings([]);
    Api.makePutRequest({
      url: `/api/vacations/${vacation.id}/undone`,
    }).then((response) => {
      setUserVacationDays(response.data.vacation.user_id, response.data.user_available_vacation_days);
      if (response.data.previous_status === 'accepted' || response.data.vacation.status === 'accepted') {
        removeFromInteractedVacations(response.data.vacation, response.data.vacation.status.slice(0, -1));
      }
      if (_.includes(['unconfirmed', 'approved'], response.data.vacation.status)) { getVacations(); }
      if ((response.data.previous_status === response.data.vacation.status)
         || (response.data.previous_status === 'accepted' && response.data.vacation.status === 'declined')) {
        updateVacation(vacation.id);
      }
    });
  }

  function onDeleteClick() {
    Api.makeDeleteRequest({
      url: `/api/vacations/${vacation.id}`,
    }).then(() => {
      removeFromInteractedVacations(vacation);
    });
  }

  function onAcceptClick() {
    Api.makePostRequest({
      url: `/api/vacations/${vacation.id}/approve`,
      body: { vacation: { vacation_sub_type: '' } },
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { setErrors(response.data.errors); return; }
      setUserVacationDays(response.data.vacation.user_id, response.data.user_available_vacation_days);
      if (!_.isEmpty(response.data.warnings)) {
        setWarnings(response.data.warnings);
        setState({
          ...state,
          vacation: {
            ...response.data.vacation,
            interacted: true,
          },
        });
        return;
      }
      if (response.data.previous_status === 'declined') { removeFromInteractedVacations(response.data.vacation, 'accept'); }
    });
  }

  function onDeclineClick() {
    Api.makePostRequest({
      url: `/api/vacations/${vacation.id}/decline`,
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { setErrors(response.data.errors); return; }
      setUserVacationDays(response.data.vacation.user_id, response.data.user_available_vacation_days);
      if (_.includes(['accepted', 'approved'], response.data.previous_status)) { removeFromInteractedVacations(response.data.vacation, 'decline'); }
      addToInteractedVacations(response.data.vacation, 'decline');
      if (response.data.previous_status === response.data.vacation.status) { updateVacation(vacation.id); }
    });
  }

  function Buttons() {
    let result;
    if (!window.currentUser.staff_manager) {
      result = null;
    } else if (vacation.interacted) {
      result = (
        <div className="vacation-buttons">
          <button className="bt-vacation undone" type="button" onClick={onUndoneClick}>
            <span className="bt-txt">{I18n.t('apps.staff.undone')}</span>
          </button>
        </div>
      );
    } else if (vacation.self_declined) {
      result = (
        <div className="vacation-buttons">
          <button className="bt-vacation delete" type="button" onClick={onDeleteClick}>
            <span className="bt-txt">{I18n.t('common.destroy')}</span>
          </button>
        </div>
      );
    } else {
      result = (
        <div className="vacation-buttons">
          { vacation.status !== 'accepted' && (
            <button className="bt-vacation accept" type="button" onClick={onAcceptClick}>
              <span className="bt-txt">{I18n.t('apps.staff.accept')}</span>
            </button>
          )}
          <button className="bt-vacation decline" type="button" onClick={onDeclineClick}>
            <span className="bt-txt">{I18n.t('apps.staff.decline')}</span>
          </button>
        </div>
      );
    }
    return result;
  }

  function UnfoldedVacation() {
    return (
      <div className={`accepted-or-declined-vacation ${vacation.status}`} onClick={onVacationClick}>
        <Errors errors={errors} />
        <Warnings warnings={warnings} />
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
        <Interactions vacation={vacation} />
      </div>
    );
  }

  return (
    <div>
      <div>
        { folded ? <FoldedVacation /> : <UnfoldedVacation /> }
      </div>
    </div>
  );
}

export default InteractedVacation;
