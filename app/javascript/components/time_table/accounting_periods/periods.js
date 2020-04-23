import React from 'react';
import URI from 'urijs';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import _ from 'lodash';
import * as Api from '../../shared/api';
import Period from './period';

class Periods extends React.Component {
  constructor(props) {
    super(props);

    this.getPeriods = this.getPeriods.bind(this);
    this.renderPagination = this.renderPagination.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onGeneratePeriodsChange = this.onGeneratePeriodsChange.bind(this);
    this.onGenerateSubmit = this.onGenerateSubmit.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.recountPeriods = this.recountPeriods.bind(this);
    this.getRecountingPeriodsState = this.getRecountingPeriodsState.bind(this);

    this.onPreviousUserChange = this.onPreviousUserChange.bind(this);
    this.onNextUserChange = this.onNextUserChange.bind(this);

    this.state = {
      periods: {
        accounting_periods: [],
        total_pages: 0,
      },
      generatePeriods: {
        periods_count: undefined,
        month: moment().format('MM'),
        year: moment().format('YYYY'),
      },
      userId: undefined,
      user: {},
    };
  }

  componentDidMount() {
    const base = URI(window.location.href);
    const params = base.query(true);
    const userId = (params.user_id || currentUser.id);
    const page = params.page || 1;

    this.getPeriods({ userId, page });
  }

  componentWillUnmount() {
    if (this.recountingTimer) {
      clearInterval(this.recountingTimer);
    }
  }

  getPeriods(options) {
    Api.makeGetRequest({
      url: `/api/accounting_periods?user_id=${options.userId}&page=${options.page}`,
    }).then((response) => {
      const periods = response.data;

      Api.makeGetRequest({ url: `/api/users/${options.userId}` })
        .then((userResponse) => {
          this.setState({
            periods,
            userId: options.userId,
            user: userResponse.data,
            page: options.page,
            recounting: periods.recounting,
          });
          if (!!periods.recounting && !this.recountingTimer) {
            this.recountingTimer = setInterval(this.getRecountingPeriodsState, 1000);
          }
        });
    });
  }

  onPageChange(e) {
    e.preventDefault();
    const href = URI(e.target.href);
    const params = href.query(true);

    const { userId, page } = this.state;

    if (params.user_id !== userId || params.page !== page) {
      this.getPeriods({ userId: params.user_id, page: params.page });
      window.history.pushState('Timetable', 'Accounting Periods', href);
    }
  }

  onPreviousUserChange() {
    const id = this.state.user.prev_id;

    if (id) {
      this.getPeriods({ userId: id, page: 1 });
      window.history.pushState('TimeTable',
        'Accounting Periods',
        URI(window.location.href).search({ user_id: id }));
    }
  }

  onNextUserChange() {
    const id = this.state.user.next_id;

    if (id) {
      this.getPeriods({ userId: id, page: 1 });
      window.history.pushState('TimeTable',
        'Accounting Periods',
        URI(window.location.href).search({ user_id: id }));
    }
  }

  onGenerateSubmit() {
    const { periods_count, year, month } = this.state.generatePeriods;

    const date = moment(`${year}-${month}`, 'YYYY-MM');
    const day = moment(moment(date).startOf('month')).format('YYYY-MM-DD');

    const params = {
      user_id: this.state.userId,
      periods_count,
      start_on: moment(`${date.format('YYYY-MM')}-${day}`, 'YYYY-MM-DD'),
    };

    Api.makePostRequest({
      url: '/api/accounting_periods/generate',
      body: params,
    }).then((response) => {
      this.setState({
        periods: {
          accounting_periods: response.data,
        },
      });
    }).catch(() => {
      alert('There was an error with generate');
    });
  }

  onGeneratePeriodsChange(e) {
    const { name, value } = e.target;

    this.setState((prevState) => ({
      generatePeriods: {
        ...prevState.generatePeriods,
        [name]: value,
      },
    }));
  }

  recountPeriods() {
    const { recounting } = this.state;

    if (!recounting) {
      Api.makePostRequest({
        url: '/api/accounting_periods/recount',
        body: { user_id: this.state.userId },
      }).then((response) => {
        if (response.data.jid) {
          this.setState({ recounting: true });
          this.recountingTimer = setInterval(this.getRecountingPeriodsState, 1000);
        }
      });
    }
  }

  getRecountingPeriodsState() {
    Api.makeGetRequest({
      url: `/api/accounting_periods/recount_status?user_id=${this.state.userId}`,
    }).then((response) => {
      const { userId, page } = this.state;
      if (response.data.complete) {
        clearInterval(this.recountingTimer);
        this.setState({ recounting: false });
        this.getPeriods({ userId, page });
      }
    });
  }

  renderButtons() {
    const { recounting } = this.state;

    if (currentUser.admin) {
      return (
        <div className="row periods-actions">
          <div className="col-md-8">
            <NavLink className="bt bt-main" to={`/accounting_periods/new?user_id=${this.state.userId}`}>
              <span className="bt-txt">{I18n.t('apps.accounting_periods.add')}</span>
              <i className="symbol fa fa-calendar-plus-o" />
            </NavLink>
            <a id="generate" className="bt bt-second">
              <span className="bt-txt">{I18n.t('apps.accounting_periods.generate_periods')}</span>
              <i className="symbol fa fa-calendar-plus-o" />
            </a>
          </div>
          <div className="col-md-4 text-right">
            <a
              id="recount"
              onClick={this.recountPeriods}
              disabled={!!recounting}
              className={`bt bt-second ${recounting ? 'disabled-button-wrapper' : ''}`}
            >
              <span className="bt-txt">{I18n.t('apps.accounting_periods.recount_periods')}</span>
              <i className="symbol fa fa-repeat" />
            </a>
          </div>
        </div>
      );
    }
    return (<div />);
  }

  renderPagination() {
    let { page } = this.state;
    const { userId, periods } = this.state;
    const { total_pages } = periods;

    page = parseInt(page, 10);

    const isBackAvailable = (page !== 1);
    const isForwardAvailable = (total_pages > 1 && page !== total_pages);

    return (
      <ul className="pagination pull-right">
        {isBackAvailable && (
          <li id="prevPage">
            <a className="symbol fa fa-chevron-left" onClick={this.onPageChange} href={`/accounting_periods?user_id=${userId}&page=${page - 1}`} />
          </li>
        )}
        {this.paginationBody(total_pages, page, userId)}
        {isForwardAvailable && (
          <li className={!isForwardAvailable ? 'disabled' : ''} id="nextPage">
            <a className="symbol fa fa-chevron-right" onClick={this.onPageChange} href={isForwardAvailable ? `/accounting_periods?user_id=${userId}&page=${page + 1}` : '#'} />
          </li>
        )}
      </ul>
    );
  }

  paginationBody(size, page, userId) {
    const li = [];

    for (let i = 1; i < size + 1; i += 1) {
      li.push(
        <li key={i} className={`page ${parseInt(page, 10) === i ? 'active' : ''}`}>
          <a onClick={this.onPageChange} className="page" href={`/accounting_periods?user_id=${userId}&page=${i}`}>{i}</a>
        </li>,
      );
    }

    return li;
  }

  onDelete(id) {
    Api.makeDeleteRequest({ url: `/api/accounting_periods/${id}` })
      .then((response) => {
        if (parseInt(response.status, 10) === 204) {
          this.setState((prevState) => ({
            periods: {
              accounting_periods: prevState.periods.accounting_periods.filter((period) => (period.id !== id)),
            },
          }));
        } else {
          alert('Error while trying to remove accounting period');
        }
      });
  }

  generateMonths() {
    const options = [];

    for (let i = 1; i <= 12; i += 1) {
      options.push(
        <option key={i} value={i}>{i}</option>,
      );
    }

    return options;
  }

  generateYears() {
    const options = [];
    const currentYear = parseInt(moment().format('YYYY'), 10);
    const maxYear = currentYear + 10;

    for (let i = currentYear; i <= maxYear; i += 1) {
      options.push(
        <option key={i} value={i}>{i}</option>,
      );
    }

    return options;
  }

  renderUserInfo(user) {
    if (_.isEmpty(user)) {
      return (
        <div style={{ width: '390px', display: 'inline-block' }} className="preloader" />
      );
    }
    return (
      <span><NavLink to={`/timesheet?user_id=${user.id}`}>{user.name}</NavLink></span>
    );
  }

  render() {
    const {
      periods, user, userId, generatePeriods,
    } = this.state;
    const MONTHS_IN_YEAR = 12;

    return (
      <div className="accounting-periods-list">
        <Helmet>
          <title>{I18n.t('common.accounting_periods')}</title>
        </Helmet>
        {currentUser.admin && this.renderButtons()}
        <div className="offset-md-3 col-md-6 vert-offset-bottom clearfix">
          {currentUser.admin && (
            <h3 className="text-center text-muted">
              {user.prev_id && <a onClick={this.onPreviousUserChange} className="fa fa-chevron-left pull-left" />}
              {this.renderUserInfo(user)}
              <span>
                {user.next_id && <a onClick={this.onNextUserChange} className="fa fa-chevron-right pull-right" />}
              </span>
            </h3>
          )}
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{I18n.t('common.position')}</th>
              <th>{I18n.t('common.person')}</th>
              <th>{I18n.t('common.from')}</th>
              <th>{I18n.t('common.to')}</th>
              <th>{I18n.t('common.duration')}</th>
              <th className="text-left">{I18n.t('apps.accounting_periods.note')}</th>
              <th>{I18n.t('apps.accounting_periods.closed')}</th>
              <th>{I18n.t('apps.accounting_periods.full_time')}</th>
              { currentUser.admin ? <th /> : null }
            </tr>
          </thead>
          <tbody>
            { periods.accounting_periods.map((period) => (
              <Period
                key={period.id}
                period={period}
                onDelete={this.onDelete}
                userName={userId ? `${user.first_name} ${user.last_name}` : `${currentUser.first_name} ${currentUser.last_name}`}
              />
            )) }
          </tbody>
        </table>
        {this.renderPagination()}
        <div id="modal" style={{ display: 'none' }}>
          <div className="ui centered-modal modal transition visible active">
            <i className="close icon" />
            <div className="header">{I18n.t('apps.accounting_periods.generate_accounting_periods')}</div>
            <div className="content">
              <form className="form ui">
                <div className="error hidden message ui">
                  <p />
                </div>
                <div className="fields inline">
                  <div className="field">
                    <label>{I18n.t('apps.accounting_periods.periods_count')}</label>
                    <input
                      type="number"
                      onChange={this.onGeneratePeriodsChange}
                      max={MONTHS_IN_YEAR * 5}
                      value={generatePeriods.periods_count}
                      name="periods_count"
                      placeholder="periods count"
                    />
                  </div>
                  <div className="field">
                    <label>{I18n.t('apps.accounting_periods.starting_from_month')}</label>
                    <select onChange={this.onGeneratePeriodsChange} value={parseInt(generatePeriods.month, 10)} className="dropdown ui" id="month" type="text" name="month">
                      {this.generateMonths()}
                    </select>
                  </div>
                  <div className="field">
                    <select onChange={this.onGeneratePeriodsChange} value={parseInt(generatePeriods.year, 10)} className="dropdown ui" id="year" type="text" name="year">
                      {this.generateYears()}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="actions">
              <button onClick={this.onGenerateSubmit} className="button green icon labeled right ui" id="generate" type="button">
                {I18n.t('apps.accounting_periods.generate')}
                <i className="angle double icon right" />
              </button>
            </div>
          </div>
          <div className="ui dimmer modals modal-backdrop page transition visible active" style={{ display: 'flex !important' }} />
        </div>
      </div>
    );
  }
}

export default Periods;
