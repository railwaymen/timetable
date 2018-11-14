import React from 'react';
import PropTypes from 'prop-types';
import URI from 'urijs';
import * as Api from '../../shared/api.js';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { Redirect, NavLink } from 'react-router-dom';

class EditPeriod extends React.Component {
  constructor (props) {
    super(props);

    this.getPeriod = this.getPeriod.bind(this);
    this.getUsers = this.getUsers.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onStartsAtChange = this.onStartsAtChange.bind(this);
    this.onEndsAtChange = this.onEndsAtChange.bind(this);
  }

  static propTypes = {
    period: PropTypes.object
  }

  state = {
    period: {},
    users: [],
    redirectToReferer: undefined
  }

  componentDidMount () {
    let base = URI(window.location.href);
    let queries = base.query(true);
    let userId = queries['user_id'] ? queries['user_id'] : currentUser.id;
    let pathId = parseInt(_.last(base.path().split('/')));
    let periodId = isNaN(pathId) ? null : pathId;

    this.setState({
      period: {
        user_id: userId
      }
    }, () => {
      if (periodId) {
        this.getPeriod(periodId);
      }

      this.getUsers();
    })
  }

  getPeriod (id) {
    Api.makeGetRequest({ url: `/api/accounting_periods/${id}` })
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          let hours = this.formatTimeHours(data.duration);
          let minutes = this.formatTimeMinutes(data.duration);

          hours = this.formatTimeHours(response.data.duration)
          this.setState({
            period: {
              ...response.data,
              hours: hours,
              minutes: minutes
            }
          })
        }
    })
  }

  getUsers () {
    Api.makeGetRequest({ url: '/api/users' })
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            users: response.data
          })
        }
    })
  }

  onChange (e) {
    this.setState({
      period: {
        ...this.state.period,
        [e.target.name]: e.target.value
      }
    })
  }

  onCheckboxChange (e) {
    const name = e.target.name;

    this.setState({
      period: {
        ...this.state.period,
        [name]: !this.state.period[name]
      }
    })
  }

  request (period) {
    let duration = moment.duration(`${period.hours}:${period.minutes}`, 'HH:mm').asSeconds();

    if (period.id) {
      return Api.makePutRequest({
        url: `/api/accounting_periods/${period.id}?user_id=${period.user_id}`,
        body: { accounting_period: { ...period, duration: duration } }
      })
    } else {
      return Api.makePostRequest({
        url: `/api/accounting_periods?user_id=${period.user_id}`,
        body: { accounting_period: { ...period, duration: duration } }
      })
    }
  }

  formatTimeMinutes (duration) {
    let d = moment.duration(duration, 'seconds').asMinutes();
    let minutes = Math.floor(d % 60);

    if (minutes < 10) minutes = `0${minutes}`;

    return minutes;
  }

  formatTimeHours (duration) {
    let d = moment.duration(duration, 'seconds').asMinutes();
    let hours = Math.floor(d / 60);

    if (hours < 10) hours = `0${hours}`;

    return hours;
  }

  onSubmit () {
    const period = this.state.period;

    this.request(period)
        .then((response) => {
          switch (parseInt(response.status)) {
            case 200:
            case 201:
            case 204:
              this.setState({
                redirectToReferer: `/accounting_periods?user_id=${period.user_id}`
              })
              break;
            case 422:
              this.setState({
                errors: response.data.errors
              });
              break;
            default:
              alert('There was an error trying to make a request');
          }
        })
  }

  onStartsAtChange (time) {
    this.setState({
      period: {
        ...this.state.period,
        starts_at: time
      }
    })
  }

  onEndsAtChange (time) {
    this.setState({
      period: {
        ...this.state.period,
        ends_at: time
      }
    })
  }

  render () {
    const { period, users, redirectToReferer } = this.state;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />)
    if (!currentUser.admin) return (<Redirect to="/" />)

    return (
      <div id="content">
        <div>
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <select className="form-control" name="user_id" value={period.user_id} onChange={this.onChange}>
                { users.map((user, index) => (
                  <option key={index} value={user.id}>{user.first_name} {user.last_name}</option>
                )) }
              </select>
            </div>
            <div className="col-md-6 form-group">
              <DatePicker dateFormat="YYYY-MM-DD HH:mm" className="form-control" selected={moment(period.starts_at)} name="starts_at" placeholder="From" onChange={this.onStartsAtChange} />
            </div>
            <div className="col-md-6 form-group">
              <DatePicker dateFormat="YYYY-MM-DD HH:mm" className="form-control" selected={moment(period.ends_at)} name="ends_at" placeholder="To" onChange={this.onEndsAtChange} />
            </div>
            <div className="form-group">
              <textarea className="form-control" name="note" placeholder="Note" onChange={this.onChange} value={period.note}></textarea>
            </div>
            <label>Duration</label>
            <div className="form-group input-group">
              <input className="form-control" type="text" name="hours" onChange={this.onChange} value={period.hours} />
              <div className="input-group-addon">h</div>
              <input className="form-control" type="text" name="minutes" onChange={this.onChange} value={period.minutes} />
              <div className="input-group-addon">m</div>
            </div>
            <div className="form-group">
              <label>Closed?
                <input type="checkbox" name="closed" checked={period.closed} onChange={this.onCheckboxChange} />
              </label>
            </div>
            <div className="form-group">
              <label>Fulltime?
                <input type="checkbox" name="full_time" checked={period.full_time} onChange={this.onCheckboxChange} />
              </label>
            </div>
            <div className="form-group">
              <label>Position</label>
              <input className="form-control" type="number" name="position" value={period.position} onChange={this.onChange} />
            </div>
          </form>
          <NavLink className="btn btn-default" to="/accounting_periods" data-navigate="">Cancel</NavLink>
          <button onClick={this.onSubmit} className="btn btn-primary" type="button">Save</button>
        </div>
      </div>
    )
  }
}

export default EditPeriod;
