import React from 'react'
import moment from 'moment';
import * as Api from '../../shared/api';

class UnconfirmedVacation extends React.Component {
  constructor(props) {
    super(props);

    this.renderVacationType = this.renderVacationType.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.onDeclineClick = this.onDeclineClick.bind(this);
    this.onAcceptClick = this.onAcceptClick.bind(this);
    this.onUndoneClick = this.onUndoneClick.bind(this);
    this.renderInteractions = this.renderInteractions.bind(this);
  }

  state = {
    vacationSubType: this.props.vacation.vacation_sub_type ? this.props.vacation.vacation_sub_type : '',
    vacationApprovers: this.props.vacation.approvers ? this.props.vacation.approvers.split(',').filter(Boolean) : [],
    disableApproveBtn: this.props.vacation.disable_approve_btn,
    vacationDecliners: this.props.vacation.decliners ? this.props.vacation.decliners.split(',').filter(Boolean) : [],
    disableDeclineBtn: this.props.vacation.disable_decline_btn,
    errors: [],
  }

  onDeclineClick() {
    let { vacationDecliners, vacationApprovers } = this.state;
    Api.makePostRequest({
      url: `/api/vacations/${this.props.vacation.id}/decline`
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { this.props.showErrors(response.data.errors); return; }
      if (_.includes(['accepted', 'approved'], response.data.previous_status)) { this.props.removeFromAcceptedOrDeclined(response.data.vacation, 'decline') }
      this.props.addToAcceptedOrDeclinedVacationList(response.data.vacation, 'decline');
      vacationDecliners.push(response.data.user_full_name);
      const index = vacationApprovers.indexOf(response.data.user_full_name)
      if (index != -1) { vacationApprovers.splice(index, 1) }
      this.setState({
        vacationDecliners: vacationDecliners,
        disableDeclineBtn: true,
        disableApproveBtn: false,
        errors: [],
      })
    })
  }

  onAcceptClick() {
    let { vacationApprovers, vacationDecliners, vacationSubType } = this.state;

    Api.makePostRequest({
      url: `/api/vacations/${this.props.vacation.id}/approve`,
      body: { vacation: { vacation_sub_type: vacationSubType } }
    }).then((response) => {
      if (!_.isEmpty(response.data.errors)) { this.showErrors(response.data.errors); return; }
      if (response.data.vacation.status === 'accepted') { this.props.addToAcceptedOrDeclinedVacationList(response.data.vacation, 'accept') }
      if (response.data.previous_status === 'declined') { this.props.removeFromAcceptedOrDeclined(response.data.vacation, 'accept') }
      vacationApprovers.push(response.data.user_full_name);
      const index = vacationDecliners.indexOf(response.data.user_full_name)
      if (index != -1) { vacationDecliners.splice(index, 1) }
      this.setState({
        vacationApprovers: vacationApprovers,
        disableApproveBtn: true,
        disableDeclineBtn: false,
        errors: [],
      })
    })
  }

  onUndoneClick() {
    let { vacationApprovers, vacationDecliners } = this.state;

    Api.makePutRequest({
      url: `/api/vacations/${this.props.vacation.id}/undone`
    }).then((response) => {
      if (_.includes(['approved', 'accepted'], response.data.previous_status)) {
        const index = vacationApprovers.indexOf(`${currentUser.last_name} ${currentUser.first_name}`);
        if (index != -1) { vacationApprovers.splice(index, 1) }
        if (response.data.previous_status === 'accepted') { this.props.removeFromAcceptedOrDeclined(response.data.vacation) }
      }
      if (response.data.previous_status === 'declined') {
        const index = vacationDecliners.indexOf(response.data.user_full_name);
        vacationDecliners.splice(index, 1)
        if (response.data.vacation.status != 'declined' && this.props.showDeclined) { this.props.removeFromAcceptedOrDeclined(response.data.vacation) }
      }
      if (response.data.vacation.status === 'accepted' && this.props.showAll) { this.props.addToAcceptedOrDeclinedVacationList(response.data.vacation) }
      if (response.data.vacation.status === 'declined' && this.props.showDeclined) { this.props.addToAcceptedOrDeclinedVacationList(response.data.vacation) }
      this.setState({
        vacationApprovers: vacationApprovers,
        vacationDecliners: vacationDecliners,
        disableApproveBtn: false,
        disableDeclineBtn: false,
        errors: [],
      })
    })
  }

  showErrors(errors) {
    this.setState({
      errors: errors
    })
  }

  renderErrors() {
    const { errors } = this.state;
    let errorList = []
    errors.forEach((error) => {
      Object.keys(error).forEach((err) => {
        errorList.push(<div className={err} key={err}>{error[err]}</div>)
      })
    })
    return(
      <div className='row vacation-errors error-tooltip'>
        {errorList}
      </div>
    )
  }

  onSelectChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  renderVacationType(vacation) {
    if (vacation.vacation_type === 'others') {
      return(
        <div className="vacation-sub-type">
          <select className="form-control" name="vacationSubType" value={this.state.vacationSubType} onChange={this.onSelectChange}>
            <option value=''>{I18n.t('apps.staff.choose')}</option>
            <option value="paternity">{I18n.t('common.paternity')}</option>
            <option value="parental">{I18n.t('common.parental')}</option>
            <option value="upbringing">{I18n.t('common.upbringing')}</option>
            <option value="unpaid">{I18n.t('common.unpaid')}</option>
            <option value="rehabilitation">{I18n.t('common.rehabilitation')}</option>
            <option value="illness">{I18n.t('common.illness')}</option>
            <option value="care">{I18n.t('common.care_definition')}</option>
          </select>
        </div>
      )
    }
    else {
      return(
        <div className="vacation-type">
          <span>
            {I18n.t(`common.${vacation.vacation_type}`)}
          </span>
        </div>
      )
    }
  }

  renderButtons() {
    const { disableApproveBtn, disableDeclineBtn } = this.state;
    if (disableApproveBtn || disableDeclineBtn) {
      return(
        <div className="vacation-buttons">
          <button className="bt-vacation undone" type="button" onClick={this.onUndoneClick}>
            <span className="bt-txt">{I18n.t('apps.staff.undone')}</span>
          </button>
        </div>
      )
    }
    else {
      return(
        <div className="vacation-buttons">
          <button className="bt-vacation accept" type="button" onClick={this.onAcceptClick} disabled={disableApproveBtn}>
            <span className="bt-txt">{I18n.t('apps.staff.accept')}</span>
          </button>
          <button className="bt-vacation decline" type="button" onClick={this.onDeclineClick} disabled={disableDeclineBtn}>
            <span className="bt-txt">{I18n.t('apps.staff.decline')}</span>
          </button>
        </div>
      )
    }
  }

  renderInteractions() {
    let approvers = [];
    let decliners = [];
    const { vacationApprovers, vacationDecliners } = this.state;
    if (vacationApprovers) {
      for (let i = 0; i < vacationApprovers.length; i++) {
        approvers.push(<div className="approver" key={i}>
                         {I18n.t('apps.staff.approved_by')}
                         <span className="interactor-name"> {vacationApprovers[i]}</span>
                       </div>);
      }
    }
    if (vacationDecliners) {
      for (let i = 0; i < vacationDecliners.length; i++) {
        decliners.push(<div className="decliner" key={i}>
                         {I18n.t('apps.staff.declined_by')}
                         <span className="interactor-name"> {vacationDecliners[i]}</span>
                       </div>);
      }
    }
    return(
      <div className="interactions-list">
        {approvers}
        {decliners}
      </div>
    )
  }

  render() {
    const vacation = this.props.vacation;
    const { errors } = this.state;

    return(
      <div className={`unconfirmed-vacation ${vacation.status}`}>
        { errors.length > 0
            && this.renderErrors()
        }
        <div className="vacation-header">
          <div className="user-full-name">
            {vacation.full_name}
          </div>
          <div className="vacation-time-period">
            {moment(vacation.start_date).format('DD/MM/YYYY')}-{moment(vacation.end_date).format('DD/MM/YYYY')}
          </div>
        </div>
        <div className="vacation-description">
          {vacation.description}
        </div>
        <div className="vacation-footer">
          {this.renderVacationType(vacation)}
          {this.renderButtons()}
        </div>
        {this.renderInteractions()}
        { window.currentUser.staff_manager
            && <div className="available_vacation_days">
                 {I18n.t('apps.staff.available_vacation_days')}:
                 <span className="vacation-days"> {vacation.available_vacation_days}</span>
               </div>
        }
      </div>
    )
  }
}

export default UnconfirmedVacation