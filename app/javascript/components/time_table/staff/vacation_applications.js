import React from 'react';
import moment from 'moment';
import URI from 'urijs';
import AcceptedVacations from './accepted_or_declined_vacations';
import UnconfirmedVacations from './unconfirmed_vacations';
import * as Api from '../../shared/api';

class VacationApplications extends React.Component {
  constructor(props) {
    super(props);

    this.getVacationApplications = this.getVacationApplications.bind(this);
    this.removeFromAcceptedOrDeclined = this.removeFromAcceptedOrDeclined.bind(this);
    this.addToAcceptedOrDeclinedVacationList = this.addToAcceptedOrDeclinedVacationList.bind(this);
    this.onShowButtonChange = this.onShowButtonChange.bind(this);
    this.removeFromUnconfirmedVacationList = this.removeFromUnconfirmedVacationList.bind(this);

    this.state = {
      acceptedOrDeclinedVacationsList: [],
      unconfirmedVacationsList: [],
      showAll: false,
      showDeclined: false,
    };
  }

  componentDidMount() {
    const urlQuery = URI.parseQuery(URI(window.location.href).query());
    const { end_date, user_id } = urlQuery;
    let { start_date, sort } = urlQuery;
    this.props.urlFilters({ start_date, end_date, user_id });
    if (!start_date) { start_date = moment().startOf('month').format('DD/MM/YYYY'); }
    if (!sort) { sort = 'asc'; }
    this.getVacationApplications({ start_date, sort }, false);
  }

  getVacationApplications(params = {}, ignore_url = true) {
    const {
      start_date, end_date, user_id, sort,
    } = params;
    const urlFilters = URI.parseQuery(URI(window.location.href).query());
    const prepareParams = {
      start_date, end_date, user_id, sort,
    };

    if (!start_date) { if (!urlFilters.start_date || ignore_url) { delete prepareParams.start_date; } else { prepareParams.start_date = urlFilters.start_date; } }
    if (!end_date) { if (!urlFilters.end_date || ignore_url) { delete prepareParams.end_date; } else { prepareParams.end_date = urlFilters.end_date; } }
    if (!user_id) { if (!urlFilters.user_id || ignore_url) { delete prepareParams.user_id; } else { prepareParams.user_id = urlFilters.user_id; } }
    if (!sort) { if (!urlFilters.sort || ignore_url) { prepareParams.sort = this.acceptedVacations.state.sort; } else { prepareParams.sort = urlFilters.sort; } }

    const url = URI('/api/vacations/vacation_applications');
    if (this.state.showAll) { url.addSearch({ show_all: true }); }
    if (this.state.showDeclined) { url.addSearch({ show_declined: true }); }
    url.addSearch(prepareParams);

    Api.makeGetRequest({ url })
      .then((response) => {
        const newPath = URI(window.location.href)
          .removeSearch('start_date')
          .removeSearch('end_date')
          .removeSearch('user_id')
          .removeSearch('sort')
          .addSearch(prepareParams);

        window.history.pushState('Timetable', 'Staff', newPath);
        this.setState({
          acceptedOrDeclinedVacationsList: response.data.accepted_or_declined_vacations,
          unconfirmedVacationsList: response.data.unconfirmed_vacations,
        }, () => this.acceptedVacations.setSort(prepareParams.sort));
      });
  }

  removeFromAcceptedOrDeclined(object, action) {
    if ((this.state.showDeclined && action === 'decline') || (!this.state.showDeclined && action === 'accept')) { return; }
    const { acceptedOrDeclinedVacationsList } = this.state;
    const index = acceptedOrDeclinedVacationsList.findIndex((vacation) => vacation.id === object.id);
    if (index !== -1) {
      acceptedOrDeclinedVacationsList.splice(index, 1);
      this.setState({
        acceptedOrDeclinedVacationsList,
      });
    }
  }

  addToAcceptedOrDeclinedVacationList(object, action) {
    if ((this.state.showDeclined && action === 'accept') || (!this.state.showDeclined && action === 'decline')) {
      this.removeFromUnconfirmedVacationList(object);
      return;
    }
    const { acceptedOrDeclinedVacationsList, unconfirmedVacationsList } = this.state;
    const acceptedOrDeclinedIndex = acceptedOrDeclinedVacationsList.findIndex((vacation) => vacation.id === object.id);
    const undefinedIndex = unconfirmedVacationsList.findIndex((vacation) => vacation.id === object.id);
    if (acceptedOrDeclinedIndex === -1 && undefinedIndex !== -1) {
      unconfirmedVacationsList.splice(undefinedIndex, 1);
      this.setState({
        acceptedOrDeclinedVacationsList: [object].concat(acceptedOrDeclinedVacationsList),
        unconfirmedVacationsList,
      });
    }
  }

  removeFromUnconfirmedVacationList(object) {
    if (window.currentUser.staff_manager) {
      const { unconfirmedVacationsList } = this.state;
      const undefinedIndex = unconfirmedVacationsList.findIndex((vacation) => vacation.id === object.id);
      unconfirmedVacationsList.splice(undefinedIndex, 1);
      this.setState({
        unconfirmedVacationsList,
      });
    }
  }

  onShowButtonChange(name) {
    const original = URI(window.location.href);
    const {
      start_date, end_date, user_id, sort,
    } = URI.parseQuery(original.query());
    this.setState((prevState) => ({
      [name]: !prevState[name],
    }), () => {
      this.getVacationApplications({
        start_date, end_date, user_id, sort,
      });
    });
  }

  render() {
    const { acceptedOrDeclinedVacationsList, unconfirmedVacationsList } = this.state;
    return (
      <div className="container vacations-container">
        <div className="row">
          <div className="col-md-6">
            <AcceptedVacations
              ref={(acceptedVacations) => { this.acceptedVacations = acceptedVacations; }}
              acceptedOrDeclinedVacationsList={acceptedOrDeclinedVacationsList}
              onShowButtonChange={this.onShowButtonChange}
              showDeclined={this.state.showDeclined}
              removeFromAcceptedOrDeclined={this.removeFromAcceptedOrDeclined}
              addToAcceptedOrDeclinedVacationList={this.addToAcceptedOrDeclinedVacationList}
              showAll={this.state.showAll}
              getVacationApplications={this.getVacationApplications}
            />
          </div>
          <div className="col-md-6">
            <UnconfirmedVacations
              ref={(unconfirmed_vacations) => { this.unconfirmed_vacations = unconfirmed_vacations; }}
              unconfirmedVacationsList={unconfirmedVacationsList}
              removeFromAcceptedOrDeclined={this.removeFromAcceptedOrDeclined}
              addToAcceptedOrDeclinedVacationList={this.addToAcceptedOrDeclinedVacationList}
              onShowButtonChange={this.onShowButtonChange}
              showAll={this.state.showAll}
              showDeclined={this.state.showDeclined}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default VacationApplications;
