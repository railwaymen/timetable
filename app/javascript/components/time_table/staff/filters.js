import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import URI from 'urijs';
import { defaultDatePickerProps } from '../../shared/helpers';

class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.onGeneralClick = this.onGeneralClick.bind(this);
    this.getActiveUsers = this.getActiveUsers.bind(this);
    this.onUserSelectFilterChange = this.onUserSelectFilterChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);

    this.state = {
      users: [],
      selectedUser: '',
      startDate: moment().startOf('month').format('DD/MM/YYYY'),
      endDate: null,
    };
  }

  componentDidMount() {
    this.getActiveUsers();
  }

  setFilters(params) {
    this.setState({
      selectedUser: params.user_id ? params.user_id : '',
      startDate: params.start_date ? params.start_date : moment().startOf('month').format('DD/MM/YYYY'),
      endDate: params.end_date ? moment(params.end_date, 'DD/MM/YYYY').format('DD/MM/YYYY') : null,
    });
  }

  getActiveUsers() {
    fetch('/api/users?filter=active&staff')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ users: data });
      });
  }

  onGeneralClick() {
    this.setState({
      selectedUser: '',
      startDate: moment().startOf('month').format('DD/MM/YYYY'),
      endDate: null,
    }, () => {
      this.onFilterChange();
    });
  }

  onUserSelectFilterChange(e) {
    this.setState({
      selectedUser: e.target.value,
    }, () => {
      this.onFilterChange();
    });
  }

  onDateChange(name, date) {
    this.setState({
      [name]: date === null ? date : date.format('DD/MM/YYYY'),
    }, () => {
      this.onFilterChange();
    });
  }

  onFilterChange() {
    const { startDate, endDate, selectedUser } = this.state;
    const filterParams = {
      start_date: startDate,
      end_date: endDate,
      user_id: selectedUser,
    };
    this.props.onFilterChange(filterParams);
  }

  onExportClick() {
    const url = URI(window.location.href);
    window.open(`/api/vacations/generate_csv.csv?${url.query()}`, '_blank');
  }

  renderUserSelectFilter(users) {
    const { selectedUser } = this.state;
    const options = [];
    users.forEach((user) => {
      options.push(
        <option key={user.id} value={user.id}>
          {`${user.last_name} ${user.first_name}`}
        </option>,
      );
    });
    return (
      <select className="form-control user-select-filter" value={selectedUser} onChange={(this.onUserSelectFilterChange)}>
        <option value="">{I18n.t('apps.staff.by_person')}</option>
        {options}
      </select>
    );
  }

  onYearlyReportClick() {
    window.open('/api/vacations/generate_yearly_report.csv', '_blank');
  }

  render() {
    const { users, startDate, endDate } = this.state;

    return (
      <div className="container filters">
        <div className="row">
          <div className="general-button">
            <button className="filter-button bt-vacation" type="button" onClick={(this.onGeneralClick)}>
              <span className="bt-txt">{I18n.t('apps.staff.general')}</span>
            </button>
          </div>
          <div className="user-filter">
            {this.renderUserSelectFilter(users)}
          </div>
          <div className="start-date-filter">
            <DatePicker
              {...defaultDatePickerProps}
              name="startDate"
              className="form-control"
              selected={startDate === null ? null : moment(startDate, 'DD/MM/YYYY')}
              value={startDate === null ? null : moment(startDate, 'DD/MM/YYYY').format('DD/MM/YYYY')}
              format="DD/MM/YYYYs"
              dateFormat="DD/MM/YYYY"
              onChange={(date) => this.onDateChange('startDate', date)}
              onSelect={(date) => this.onDateChange('startDate', date)}
            />
          </div>
          <div className="end-date-filter">
            <DatePicker
              {...defaultDatePickerProps}
              name="endDate"
              className="form-control"
              selected={endDate === null ? null : moment(endDate, 'DD/MM/YYYY')}
              value={endDate === null ? null : moment(endDate, 'DD/MM/YYYY').format('DD/MM/YYYY')}
              format="DD/MM/YYYYs"
              dateFormat="DD/MM/YYYY"
              onChange={(date) => this.onDateChange('endDate', date)}
              onSelect={(date) => this.onDateChange('endDate', date)}
            />
          </div>
          { currentUser.staff_manager ? (
            <div className="generator-buttons">
              <div className="csv-export-button">
                <button className="filter-button bt-vacation" type="button" onClick={this.onExportClick}>
                  <span className="bt-txt">{I18n.t('apps.staff.csv_export')}</span>
                </button>
              </div>
              <div className="yearly-report">
                <button className="filter-button bt-vacation" type="button" onClick={this.onYearlyReportClick}>
                  <span className="bt-txt">{I18n.t('apps.staff.yearly_report')}</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

Filters.propTypes = {
  users: PropTypes.array,
};

export default Filters;
