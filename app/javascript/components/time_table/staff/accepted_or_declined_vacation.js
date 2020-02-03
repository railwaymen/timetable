import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { NavLink } from 'react-router-dom';
import * as Api from '../../shared/api';

class AcceptedOrDeclinedVacation extends React.Component {
  constructor(props) {
    super(props);

    this.onVacationClick = this.onVacationClick.bind(this);
    this.onUndoneClick = this.onUndoneClick.bind(this);
    this.onAcceptClick = this.onAcceptClick.bind(this);
    this.onDeclineClick = this.onDeclineClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  state = {
    vacation: this.props.vacation,
    folded: true,
    fetched: false,
  }

  onVacationClick(e) {
    if ($(e.target).closest('.vacation-buttons').length || !window.currentUser.staff_manager) { return; }
    const { vacation, folded, fetched } = this.state;
    if (folded && !fetched) {
      Api.makeGetRequest({
        url: `/api/vacations/${vacation.id}`,
      }).then((response) => {
        this.setState({
          vacation: response.data,
          folded: false,
          fetched: true,
        });
      });
    } else {
      this.setState({
        folded: !folded,
      });
    }
  }

  onAcceptClick() {
    const { vacation } = this.state;

    Api.makePostRequest({
      url: `/api/vacations/${vacation.id}/approve`,
      body: { vacation: { vacation_sub_type: '' } },
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { this.showErrors(response.data.errors); return; }
      if (response.data.previous_status === 'declined') { this.props.removeFromAcceptedOrDeclined(response.data.vacation, 'accept'); }
    });
  }

  onDeclineClick() {
    const { vacation } = this.state;
    Api.makePostRequest({
      url: `/api/vacations/${vacation.id}/decline`,
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { this.props.showErrors(response.data.errors); return; }
      if (_.includes(['accepted', 'approved'], response.data.previous_status)) { this.props.removeFromAcceptedOrDeclined(response.data.vacation, 'decline'); }
      this.props.addToAcceptedOrDeclinedVacationList(response.data.vacation, 'decline');
      if (response.data.previous_status === response.data.vacation.status) { this.updateVacation(vacation.id); }
    });
  }

  onUndoneClick() {
    const { vacation } = this.state;

    Api.makePutRequest({
      url: `/api/vacations/${vacation.id}/undone`,
    }).then((response) => {
      if (response.data.previous_status === 'accepted' || response.data.vacation.status === 'accepted') { this.props.removeFromAcceptedOrDeclined(response.data.vacation); }
      if (_.includes(['unconfirmed', 'approved'], response.data.vacation.status)) { this.props.getVacationApplications({}, false); }
      if (response.data.previous_status === response.data.vacation.status) { this.updateVacation(vacation.id); }
    });
  }

  onDeleteClick() {
    const { vacation } = this.state;
    Api.makeDeleteRequest({
      url: `/api/vacations/${vacation.id}`,
    }).then(() => {
      this.props.removeFromAcceptedOrDeclined(vacation);
    });
  }

  updateVacation(vacationId) {
    Api.makeGetRequest({
      url: `/api/vacations/${vacationId}`,
    }).then((response) => {
      const vacation = response.data;
      this.setState({
        vacation,
      });
    });
  }

  renderFoldedVacation() {
    const { vacation } = this.state;
    return (
      <div className={`accepted-or-declined-vacation folded ${vacation.status}`} onClick={this.onVacationClick}>
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

  renderUnfoldedVacation() {
    const { vacation } = this.state;
    return (
      <div className={`accepted-or-declined-vacation ${vacation.status}`} onClick={this.onVacationClick}>
        <div className="vacation-header">
          <div className="user-full-name">
            {vacation.full_name}
            { window.currentUser.staff_manager
              && (
                <NavLink to={`/timesheet?user_id=${vacation.user_id}`}>
                  <i className="icon calendar" />
                </NavLink>
              )
            }
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
          {this.renderVacationType()}
          {this.renderButtons()}
        </div>
        {this.renderInteractions()}
      </div>
    );
  }

  renderButtons() {
    const { vacation } = this.state;
    let result;
    if (!window.currentUser.staff_manager) {
      result = undefined;
    } else if (vacation.interacted) {
      result = (
        <div className="vacation-buttons">
          <button className="bt-vacation undone" type="button" onClick={this.onUndoneClick}>
            <span className="bt-txt">{I18n.t('apps.staff.undone')}</span>
          </button>
        </div>
      );
    } else if (vacation.self_declined) {
      result = (
        <div className="vacation-buttons">
          <button className="bt-vacation delete" type="button" onClick={this.onDeleteClick}>
            <span className="bt-txt">{I18n.t('common.destroy')}</span>
          </button>
        </div>
      );
    } else {
      result = (
        <div className="vacation-buttons">
          { vacation.status !== 'accepted' ? (
            <button className="bt-vacation accept" type="button" onClick={this.onAcceptClick}>
              <span className="bt-txt">{I18n.t('apps.staff.accept')}</span>
            </button>
          ) : undefined }
          <button className="bt-vacation decline" type="button" onClick={this.onDeclineClick}>
            <span className="bt-txt">{I18n.t('apps.staff.decline')}</span>
          </button>
        </div>
      );
    }

    return result;
  }

  renderVacationType() {
    const { vacation } = this.state;
    const vacationSubType = vacation.vacation_sub_type ? vacation.vacation_sub_type : '';
    let result;
    if (vacation.vacation_type === 'others' && window.currentUser.staff_manager) {
      result = (
        <div className="vacation-sub-type">
          <select className="form-control" name="vacationSubType" value={vacationSubType} disabled>
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
    } else {
      result = (
        <div className="vacation-type">
          <span>
            {I18n.t(`common.${vacation.vacation_type}`)}
          </span>
        </div>
      );
    }

    return result;
  }

  renderInteractions() {
    const approvers = [];
    const decliners = [];
    const { vacation } = this.state;
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
        { vacation.self_declined ? (
          <div className="decliner">
            {I18n.t('apps.staff.canceled')}
          </div>
        ) : undefined }
      </div>
    );
  }

  render() {
    const { folded } = this.state;
    return (
      <div>
        { folded ? this.renderFoldedVacation() : this.renderUnfoldedVacation() }
      </div>
    );
  }
}

export default AcceptedOrDeclinedVacation;
