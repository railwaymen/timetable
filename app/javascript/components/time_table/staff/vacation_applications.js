import React from 'react'
import PropTypes from 'prop-types';
import AcceptedVacations from './accepted_or_declined_vacations'
import UnconfirmedVacations from './unconfirmed_vacations'
import * as Api from '../../shared/api';
import moment from 'moment';

class VacationApplications extends React.Component {
  constructor(props) {
    super(props);

    this.getVacationApplications = this.getVacationApplications.bind(this);
    this.removeFromAcceptedOrDeclined = this.removeFromAcceptedOrDeclined.bind(this);
    this.addToAcceptedOrDeclinedVacationList = this.addToAcceptedOrDeclinedVacationList.bind(this);
    this.onShowButtonChange = this.onShowButtonChange.bind(this);
  }

  static propTypes = {
    acceptedOrDeclinedVacationsList: PropTypes.array,
    unconfirmedVacationsList: PropTypes.array,
    showAll: PropTypes.bool
  }

  state = {
    acceptedOrDeclinedVacationsList: [],
    unconfirmedVacationsList: [],
    showAll: false,
    showDeclined:  false
  }

  componentDidMount() {
    this.getVacationApplications({ start_date: moment().startOf('month').format('DD/MM/YYYY') })
  }

  getVacationApplications(params = {}) {
    let { start_date, end_date, user_id } = params;

    const prepareParams = { start_date, end_date, user_id }

    if (!start_date) { delete prepareParams['start_date']; }
    if (!end_date) { delete prepareParams['end_date']; }
    if (!user_id) { delete prepareParams['user_id']; }

    const url = URI('/api/vacations/vacation_applications');
    if (this.state.showAll) { url.addSearch({ show_all: true }) }
    if (this.state.showDeclined) { url.addSearch({ show_declined: true }) }
    url.addSearch(prepareParams);
    console.log(url)

    Api.makeGetRequest({ url })
      .then((response) => {
        const newPath = URI(window.location.href)
          .removeSearch('start_date')
          .removeSearch('end_date')
          .removeSearch('user_id')
          .addSearch(prepareParams);

          window.history.pushState('Timetable', 'Staff', newPath);

          this.setState({
            acceptedOrDeclinedVacationsList: response.data.accepted_or_declined_vacations,
            unconfirmedVacationsList: response.data.unconfirmed_vacations
          })
      })
  }

  removeFromAcceptedOrDeclined(object, action) {
    if ((this.state.showDeclined && action === 'decline') || (!this.state.showDeclined && action === 'accept')) { return; }
    let { acceptedOrDeclinedVacationsList } = this.state;
    const index = acceptedOrDeclinedVacationsList.findIndex(vacation => vacation.id === object.id)
    if (index != -1) {
      acceptedOrDeclinedVacationsList.splice(index, 1)
      this.setState({
        acceptedOrDeclinedVacationsList: acceptedOrDeclinedVacationsList
      })
    }
  }

  addToAcceptedOrDeclinedVacationList(object, action) {
    if ((this.state.showDeclined && action === 'accept') || (!this.state.showDeclined && action === 'decline')) { return; }
    const { acceptedOrDeclinedVacationsList } = this.state;
    const index = acceptedOrDeclinedVacationsList.findIndex(vacation => vacation.id === object.id)
    if (index === -1) {
      this.setState({
        acceptedOrDeclinedVacationsList: [object].concat(acceptedOrDeclinedVacationsList)
      });
    }
  }

  onShowButtonChange(name) {
    const original = URI(window.location.href);
    const { start_date, end_date, user_id } = URI.parseQuery(original.query());
    this.setState({
      [name]: !this.state[name]
    }, () => {
      this.getVacationApplications({start_date: start_date, end_date: end_date, user_id: user_id});
    })
  }

  render() {
    const { acceptedOrDeclinedVacationsList, unconfirmedVacationsList } = this.state;
    return(
      <div className="row">
        <div className="col-md-6">
          <AcceptedVacations ref={(accepted_or_declined_vacations) => { this.accepted_or_declined_vacations = accepted_or_declined_vacations }} acceptedOrDeclinedVacationsList={acceptedOrDeclinedVacationsList} onShowButtonChange={this.onShowButtonChange} showDeclined={this.state.showDeclined} />
        </div>
        <div className="col-md-6">
          <UnconfirmedVacations ref={(unconfirmed_vacations) => { this.unconfirmed_vacations = unconfirmed_vacations }} unconfirmedVacationsList={unconfirmedVacationsList} removeFromAcceptedOrDeclined={this.removeFromAcceptedOrDeclined} addToAcceptedOrDeclinedVacationList={this.addToAcceptedOrDeclinedVacationList} onShowButtonChange={this.onShowButtonChange} showAll={this.state.showAll} showDeclined={this.state.showDeclined} showErrors={this.props.showErrors} />
        </div>
      </div>
    )
  }
}

export default VacationApplications
