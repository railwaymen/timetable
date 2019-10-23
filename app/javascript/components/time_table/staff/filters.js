import React from 'react'
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { defaultDatePickerProps } from '../../shared/helpers';
import * as Api from '../../shared/api';

class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.onGeneralClick = this.onGeneralClick.bind(this);
    this.getActiveUsers = this.getActiveUsers.bind(this);
    this.onUserSelectFilterChange = this.onUserSelectFilterChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.renderExportButton = this.renderExportButton.bind(this);
  }

  static propTypes = {
    users: PropTypes.array
  }

  state = {
    users: [],
    selectedUser: '',
    startDate: moment().startOf('month').format('DD/MM/YYYY'),
    endDate: null
  }

  componentDidMount() {
    this.getActiveUsers();
  }

  getActiveUsers() {
    fetch(`/api/users?filter=active&staff`)
      .then(response => response.json())
      .then((data) => {
        this.setState({ users: data });
      });
  }

  onGeneralClick() {
    this.setState({
      selectedUser: '',
      startDate: moment().startOf('month').format('DD/MM/YYYY'),
      endDate: null
    }, () => {
      this.onFilterChange();
    })
  }

  onUserSelectFilterChange(e) {
    this.setState({
      selectedUser: e.target.value
    }, () => {
      this.onFilterChange();
    })
  }

  onDateChange(name, e) {
    this.setState({
      [name]: e === null ? e : e.format('DD/MM/YYYY')
    }, () => {
      this.onFilterChange();
    })
  }

  onFilterChange() {
    const { startDate, endDate, selectedUser } = this.state;
    const filterParams = {
      start_date: startDate,
      end_date: endDate,
      user_id: selectedUser
    }
    this.props.onFilterChange(filterParams);
  }

  onExportClick() {
    const url = URI(window.location.href);
    window.open(`/api/vacations/generate_csv.csv?${url.query()}`, '_blank')
  }

  renderUserSelectFilter(users) {
    const { selectedUser } = this.state;
    let options = [];
    users.map((user, key) => {
      options.push(<option key={key} value={user.id}>{user.last_name} {user.first_name}</option>)
    })
    return(
      <select className="custom-select user-select-filter" value={selectedUser} onChange={(this.onUserSelectFilterChange)}>
        <option value=''>{I18n.t('apps.staff.by_person')}</option>
        {options}
      </select>
    )
  }

  renderExportButton() {
    return(
      <div className="col-md-1 csv-export-button">
        <a href={`/api/vacations/generate_csv.csv`}>
          <button type="button" onClick={this.onExportClick}>
            <span className="bt-txt">{I18n.t('apps.staff.csv_export')}</span>
          </button>
        </a>
      </div>
    )
  }

  render() {
    const { users, startDate, endDate } = this.state;

    return(
      <div className="container filters">
        <div className="row">
          <div className="col-sm-12 col-md-1 general-button">
            <button type="button" onClick={(this.onGeneralClick)}>
              <span className="bt-txt">{I18n.t('apps.staff.general')}</span>
            </button>
          </div>
          <div className="col-sm-12 col-md-1 user-filter" style={{marginRight: '7vw'}}>
            {this.renderUserSelectFilter(users)}
          </div>
          <div className="col-sm-12 col-md-2 start-date-filter">
            <DatePicker {...defaultDatePickerProps} name="startDate" className="form-control" selected={startDate === null ? null : moment(startDate, 'DD/MM/YYYY')} value={startDate === null ? null : moment(startDate, 'DD/MM/YYYY').format('DD/MM/YYYY')} format="DD/MM/YYYYs" dateFormat="DD/MM/YYYY" onChange={this.onDateChange.bind(this, 'startDate')} onSelect={this.onDateChange.bind(this, 'startDate')} />
          </div>
          <div className="col-sm-12 col-md-2 start-date-filter">
            <DatePicker {...defaultDatePickerProps} name="endDate" className="form-control" selected={endDate === null ? null : moment(endDate, 'DD/MM/YYYY')} value={endDate === null ? null : moment(endDate, 'DD/MM/YYYY').format('DD/MM/YYYY')} format="DD/MM/YYYYs" dateFormat="DD/MM/YYYY" onChange={this.onDateChange.bind(this, 'endDate')} onSelect={this.onDateChange.bind(this, 'endDate')} />
          </div>
          { currentUser.staff_manager
              ? (<div className="col-md-1 csv-export-button">
                  <button type="button" onClick={this.onExportClick}>
                    <span className="bt-txt">{I18n.t('apps.staff.csv_export')}</span>
                  </button>
                </div>
              ) : null
          }
          
        </div>
      </div>
    )
  }
}

export default Filters