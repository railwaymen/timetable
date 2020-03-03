import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import URI from 'urijs';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { Redirect, NavLink } from 'react-router-dom';
import { defaultDatePickerProps } from '../../shared/helpers';
import Preloader from '../../shared/preloader';
import * as Api from '../../shared/api';

class EditPeriod extends React.Component {
  constructor(props) {
    super(props);

    this.getPeriod = this.getPeriod.bind(this);
    this.getPeriodPosition = this.getPeriodPosition.bind(this);
    this.getUsers = this.getUsers.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onStartsAtChange = this.onStartsAtChange.bind(this);
    this.onEndsAtChange = this.onEndsAtChange.bind(this);

    this.state = {
      period: {
        ends_at: null,
        starts_at: null,
        hours: '168',
        minutes: '00',
        note: '',
        position: '1',
        full_time: false,
        closed: false,
      },
      errors: {},
      users: [],
      redirectToReferer: undefined,
      periodId: parseInt(this.props.match.params.id, 10),
    };
  }


  componentDidMount() {
    const userId = this.userId();
    const pathId = this.state.periodId;
    const periodId = Number.isNaN(pathId) ? null : pathId;

    this.setState((prevState) => ({
      period: {
        ...prevState.period,
        user_id: userId,
      },
    }));

    if (periodId) {
      this.getPeriod(periodId, userId);
    } else {
      this.getPeriodPosition(userId);
    }

    this.getUsers();
  }

  getPeriodPosition(userId) {
    Api.makeGetRequest({ url: `/api/accounting_periods/next_position?user_id=${userId}` })
      .then((response) => {
        this.setState((prevState) => ({
          period: {
            ...prevState.period,
            position: response.data,
          },
        }));
      });
  }

  getPeriod(id) {
    Api.makeGetRequest({ url: `/api/accounting_periods/${id}` })
      .then((response) => {
        const { data } = response;
        const hours = this.formatTimeHours(data.duration);
        const minutes = this.formatTimeMinutes(data.duration);

        if (data.starts_at) data.starts_at = moment(data.starts_at).format('YYYY-MM-DD HH:mm');
        if (data.ends_at) data.ends_at = moment(moment(data.ends_at).format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm');

        this.setState({
          period: {
            ...response.data,
            hours,
            minutes,
          },
        });
      });
  }

  getUsers() {
    Api.makeGetRequest({ url: '/api/users' })
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            users: response.data,
          });
        }
      });
  }

  onChange(e) {
    const { name, value } = e.target;

    this.setState((prevState) => ({
      period: {
        ...prevState.period,
        [name]: value,
      },
    }));
  }

  onCheckboxChange(e) {
    const { name } = e.target;

    this.setState((prevState) => ({
      period: {
        ...prevState.period,
        [name]: !prevState.period[name],
      },
    }));
  }

  request(period) {
    const duration = moment.duration(`${period.hours}:${period.minutes}`, 'HH:mm').asSeconds();

    if (period.id) {
      return Api.makePutRequest({
        url: `/api/accounting_periods/${period.id}?user_id=${period.user_id}`,
        body: { accounting_period: { ...period, duration } },
      });
    }
    return Api.makePostRequest({
      url: `/api/accounting_periods?user_id=${period.user_id}`,
      body: { accounting_period: { ...period, duration } },
    });
  }

  formatTimeMinutes(duration) {
    const d = moment.duration(duration, 'seconds').asMinutes();
    let minutes = Math.floor(d % 60);

    if (minutes < 10) minutes = `0${minutes}`;

    return minutes;
  }

  formatTimeHours(duration) {
    const d = moment.duration(duration, 'seconds').asMinutes();
    let hours = Math.floor(d / 60);

    if (hours < 10) hours = `0${hours}`;

    return hours;
  }

  onSubmit() {
    const { period } = this.state;

    this.request(period)
      .then(() => {
        this.setState({
          redirectToReferer: `/accounting_periods?user_id=${period.user_id}`,
        });
      }).catch((results) => {
        this.setState({
          errors: results.errors,
        });
      });
  }

  onStartsAtChange(time) {
    this.setState((prevState) => ({
      period: {
        ...prevState.period,
        starts_at: time,
      },
    }));
  }

  onEndsAtChange(time) {
    this.setState((prevState) => ({
      period: {
        ...prevState.period,
        ends_at: time,
      },
    }));
  }

  userId() {
    const base = URI(window.location.href);
    const queries = base.query(true);
    return queries.user_id || currentUser.id;
  }

  cancelUrl() {
    return `/accounting_periods?user_id=${this.userId()}`;
  }

  render() {
    const {
      period, users, redirectToReferer, errors, periodId,
    } = this.state;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />);
    if (!currentUser.admin) return (<Redirect to="/" />);
    if (!periodId || periodId === period.id) {
      return (
        <div id="content" className="edit-accounting-period">
          <Helmet>
            {period.id ? (
              <title>{`${I18n.t('apps.accounting_periods.edit')}`}</title>
            ) : (
              <title>{I18n.t('apps.accounting_periods.new')}</title>
            )}
          </Helmet>
          <div>
            <form className="row" onSubmit={this.onSubmit}>
              <div className="col-12 col-md-6">
                <div className="form-group">
                  <select className="form-control" name="user_id" value={period.user_id} onChange={this.onChange}>
                    { users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {currentUser.fullName.apply(user)}
                      </option>
                    )) }
                  </select>
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    name="note"
                    placeholder={I18n.t('apps.accounting_periods.note')}
                    onChange={this.onChange}
                    value={period.note || ''}
                  />
                </div>
                <div className="row form-group">
                  <div className="col-12 col-xs-6">
                    <label className="form-check-label">
                      <input type="checkbox" name="closed" checked={period.closed} onChange={this.onCheckboxChange} />
                      <span className="checkbox" />
                      <span className="ch-txt">
                        {I18n.t('apps.accounting_periods.closed')}
                        <i className="symbol state-symbol fa fa-lock" />
                      </span>
                    </label>
                  </div>
                  <div className="col-12 col-xs-6">
                    <label className="form-check-label">
                      <input type="checkbox" name="full_time" checked={period.full_time} onChange={this.onCheckboxChange} />
                      <span className="checkbox" />
                      <span className="ch-txt">
                        {I18n.t('apps.accounting_periods.full_time')}
                        <span className="symbol state-symbol symbol-full-time">
                          <i className="sub-symbol s-document fa fa-file-text-o" />
                          <i className="sub-symbol s-check fa fa-check" />
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="row calendar-row">
                  <div className="col-md-6 form-group">
                    { errors.starts_at && (
                      <div className="error-description">{errors.starts_at.join(', ')}</div>
                    )}
                    <DatePicker
                      {...defaultDatePickerProps}
                      onChangeRaw={this.onChange}
                      dateFormat="YYYY-MM-DD HH:mm"
                      className={`${errors.starts_at ? 'error' : ''} form-control`}
                      selected={period.starts_at ? moment(period.starts_at, 'YYYY-MM-DD HH:mm') : null}
                      name="starts_at"
                      placeholderText={I18n.t('common.from')}
                      onChange={this.onStartsAtChange}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    { errors.ends_at && (
                      <div className="error-description">{errors.ends_at.join(', ')}</div>
                    ) }
                    <DatePicker
                      {...defaultDatePickerProps}
                      onChangeRaw={this.onChange}
                      dateFormat="YYYY-MM-DD HH:mm"
                      className={`${errors.ends_at ? 'error' : ''} form-control`}
                      selected={period.ends_at ? moment(period.ends_at, 'YYYY-MM-DD HH:mm') : null}
                      name="ends_at"
                      placeholderText={I18n.t('common.to')}
                      onSelect={this.onEndsAtChange}
                      onChange={this.onEndsAtChange}
                    />
                  </div>
                </div>
                <label>{I18n.t('common.duration')}</label>
                <div className="row">
                  <div className="col-md-6">
                    { errors.duration && (
                      <div className="error-description">{errors.duration.join(', ')}</div>
                    )}
                    <div className="form-group input-group">
                      <input className={`${errors.duration ? 'error' : ''} form-control`} type="text" name="hours" onChange={this.onChange} value={period.hours} />
                      <div className="input-group-addon">h</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    { errors.duration && (
                      <div className="error-description">{errors.duration.join(', ')}</div>
                    )}
                    <div className="form-group input-group">
                      <input className={`${errors.duration ? 'error' : ''} form-control`} type="text" name="minutes" onChange={this.onChange} value={period.minutes} />
                      <div className="input-group-addon">m</div>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    {I18n.t('common.position')}
                    { errors.position && (
                      <div className="error-description">{errors.position.join(', ')}</div>
                    )}
                  </label>
                  <input className={`${errors.position ? 'error' : ''} form-control`} type="number" name="position" value={period.position} onChange={this.onChange} />
                </div>
              </div>
            </form>
            <div className="form-actions text-right">
              <NavLink activeClassName="" className="bt bt-second" to={this.cancelUrl()}>
                <i className="symbol fa fa-undo" />
                <span className="bt-txt">{I18n.t('common.cancel')}</span>
              </NavLink>
              <button onClick={this.onSubmit} className="bt bt-big bt-main bt-submit" type="button">
                <i className="symbol fa fa-calendar-check-o" />
                <span className="bt-txt">{I18n.t('common.save')}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Preloader rowsNumber={5} />;
  }
}

EditPeriod.propTypes = {
  period: PropTypes.object,
};

export default EditPeriod;
