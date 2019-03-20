import React from 'react';
import PropTypes from 'prop-types';
import URI from 'urijs';
import * as Api from '../../shared/api.js';
import { defaultDatePickerProps } from '../../shared/helpers.js'
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { Redirect, NavLink } from 'react-router-dom';

class EditPeriod extends React.Component {
  constructor (props) {
    super(props);

    this.getPeriod = this.getPeriod.bind(this);
    this.getPeriodPosition = this.getPeriodPosition.bind(this);
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
    period: {
      ends_at: null,
      starts_at: null,
      hours: '168',
      minutes: '00',
      note: ''
    },
    errors: {},
    users: [],
    redirectToReferer: undefined,
    periodId: parseInt(this.props.match.params.id)
  }

  componentDidMount () {
    let userId = this.userId();
    let pathId = this.state.periodId;
    let periodId = isNaN(pathId) ? null : pathId;

    this.setState({
      period: {
        ...this.state.period,
        user_id: userId
      }
    })

    if (periodId) {
      this.getPeriod(periodId, userId);
    } else {
      this.getPeriodPosition(userId);
    }

    this.getUsers();
  }

  getPeriodPosition (userId) {
    Api.makeGetRequest({ url: `/api/accounting_periods/next_position?user_id=${userId}` })
       .then((response) => {
          this.setState({
            period: {
              ...this.state.period,
              position: response.data
            }
          })
       })
  }

  getPeriod (id) {
    Api.makeGetRequest({ url: `/api/accounting_periods/${id}` })
      .then((response) => {
        let data = response.data;
        let hours = this.formatTimeHours(data.duration);
        let minutes = this.formatTimeMinutes(data.duration);

        if (data.starts_at) data.starts_at = moment(data.starts_at).format('YYYY-MM-DD HH:mm');
        if (data.ends_at) data.ends_at = moment(moment(data.ends_at).format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm')

        this.setState({
          period: {
            ...response.data,
            hours: hours,
            minutes: minutes
          }
        })
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
          this.setState({
            redirectToReferer: `/accounting_periods?user_id=${period.user_id}`
          })
        }).catch((results) => {
          this.setState({
            errors: results.errors
          });
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

  userId () {
    const base = URI(window.location.href);
    const queries = base.query(true);
    return queries['user_id'] || currentUser.id;
  }

  cancelUrl () {
    return `/accounting_periods?user_id=${this.userId()}`
  }

  _renderPreloader () {
    return (
      <div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
      </div>
    )
  }

  render () {
    const { period, users, redirectToReferer, errors, periodId } = this.state;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />)
    if (!currentUser.admin) return (<Redirect to="/" />)
    if (!periodId || periodId === period.id) {
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
                <DatePicker onChangeRaw={this.onChange} dateFormat="YYYY-MM-DD HH:mm" className="form-control" selected={period.starts_at ? moment(period.starts_at, 'YYYY-MM-DD HH:mm') : null} name="starts_at" placeholder="From" onChange={this.onStartsAtChange}
                {...defaultDatePickerProps}/>
              </div>
              <div className="col-md-6 form-group">
                <DatePicker onChangeRaw={this.onChange} dateFormat="YYYY-MM-DD HH:mm" className="form-control" selected={period.ends_at ? moment(period.ends_at, 'YYYY-MM-DD HH:mm') : null} name="ends_at" placeholder="To" onSelect={this.onEndsAtChange} onChange={this.onEndsAtChange}
                {...defaultDatePickerProps}/>
              </div>
              <div className="form-group">
                <textarea className="form-control" name="note" placeholder="Note" onChange={this.onChange} value={period.note}></textarea>
              </div>
              <label>{I18n.t('common.duration')}</label>
              <div className="form-group input-group">
                { errors.duration ?
                  <div className="error-description">{errors.duration.join(', ')}</div>
                : null }
                <input className={`${errors.duration ? 'error' : ''} form-control`} type="text" name="hours" onChange={this.onChange} value={period.hours} />
                <div className="input-group-addon">h</div>

                { errors.duration ?
                  <div className="error-description">{errors.duration.join(', ')}</div>
                : null }
                <input className={`${errors.duration ? 'error' : ''} form-control`} type="text" name="minutes" onChange={this.onChange} value={period.minutes} />
                <div className="input-group-addon">m</div>
              </div>
              <div className="form-group">
                <label>{I18n.t('apps.accounting_periods.closed')}
                  <input type="checkbox" name="closed" checked={period.closed} onChange={this.onCheckboxChange} />
                </label>
              </div>
              <div className="form-group">
                <label>{I18n.t('apps.accounting_periods.full_time')}
                  <input type="checkbox" name="full_time" checked={period.full_time} onChange={this.onCheckboxChange} />
                </label>
              </div>
              <div className="form-group">
                <label>{I18n.t('common.position')}
                   { errors.position ?
                     <div className="error-description">{errors.position.join(', ')}</div>
                   : null }
                </label>
                <input className={`${errors.position ? 'error' : ''} form-control`} type="number" name="position" value={period.position} onChange={this.onChange} />
              </div>
            </form>
            <NavLink activeClassName="" className="btn btn-default" to={this.cancelUrl()}>{I18n.t('common.cancel')}</NavLink>
            <button onClick={this.onSubmit} className="btn btn-primary" type="button">{I18n.t('common.save')}</button>
          </div>
        </div>
      )
    } else {
      return this._renderPreloader();
    }
  }
}

export default EditPeriod;
