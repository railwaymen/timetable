import React from 'react';
import PropTypes from 'prop-types';
import URI from 'urijs';
import * as Api from '../../shared/api.js';
import Period from './period.js';
import { NavLink } from 'react-router-dom';
import moment from 'moment';

class Periods extends React.Component {
  constructor (props) {
    super(props);

    this.getPeriods = this.getPeriods.bind(this);
    this._renderPagination = this._renderPagination.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onGeneratePeriodsChange = this.onGeneratePeriodsChange.bind(this);
    this.onGenerateSubmit = this.onGenerateSubmit.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.recountPeriods = this.recountPeriods.bind(this);

    this.onPreviousUserChange = this.onPreviousUserChange.bind(this);
    this.onNextUserChange = this.onNextUserChange.bind(this);
  }

  static propTypes = {
    periods: PropTypes.array,
    userId: PropTypes.number,
    user: PropTypes.object
  }

  state = {
    periods: {
      accounting_periods: [],
      total_count: 0
    },
    generatePeriods: {
      periods_count: undefined,
      month: moment().format('MM'),
      year: moment().format('YYYY')
    },
    userId: undefined,
    user: {}
  }

  componentDidMount () {
    let base = URI(window.location.href);
    let params = base.query(true)
    let userId = (params['user_id'] || currentUser.id);
    let page = params['page'] || 1;

    this.getPeriods({ userId: userId, page: page });
  }

  getPeriods (options) {
    Api.makeGetRequest({
      url: `/api/accounting_periods?user_id=${options.userId}&page=${options.page}`
    }).then((response) => {
      if (response.status === 200) {
        let periods = response.data;

        Api.makeGetRequest({ url: `/api/users/${options.userId}` })
           .then((userResponse) => {
             this.setState({
               periods: periods,
               userId: options.userId,
               user: userResponse.data,
               page: options.page,
               recounting: periods.recounting
             })
           })
      }
    })
  }

  onPageChange (e) {
    e.preventDefault();
    let href = URI(e.target.href);
    let params = href.query(true);

    const { userId, page } = this.state;

    if (params['user_id'] !== userId || params['page'] !== page) {
      this.getPeriods({ userId: params['user_id'], page: params['page'] });
      history.pushState('Timetable', 'Accounting Periods', href)
    }
  }

  onPreviousUserChange () {
    const id = this.state.user.prev_id;

    if (id) {
      this.getPeriods({ userId: id });
      window.history.pushState('TimeTable', 'Accounting Periods', URI(window.location.href).removeSearch('user_id').addSearch({ user_id: id }))
    }
  }

  onNextUserChange () {
    const id = this.state.user.next_id;

    if (id) {
      this.getPeriods({ userId: id });
      window.history.pushState('TimeTable', 'Accounting Periods', URI(window.location.href).removeSearch('user_id').addSearch({ user_id: id }))
    }
  }

  onGenerateSubmit () {
    const { periods_count, year, month } = this.state.generatePeriods;

    let date = moment(`${year}-${month}`, 'YYYY-MM');
    let day = moment(moment(date).startOf('month')).format('YYYY-MM-DD');

    let params = {
      user_id: this.state.userId,
      periods_count: periods_count,
      start_on: moment(`${date.format('YYYY-MM')}-${day}`, 'YYYY-MM-DD')
    }

    Api.makePostRequest({
      url: `/api/accounting_periods/generate`,
      body: params
    }).then((response) => {
      if (response.status === 200) {
        console.log(response.data);
        this.setState({
          periods: {
            accounting_periods: response.data
          }
        })
      }
    })
  }

  onGeneratePeriodsChange (e) {
    this.setState({
      generatePeriods: {
        ...this.state.generatePeriods,
        [e.target.name]: e.target.value
      }
    })
  }

  recountPeriods () {
    Api.makePostRequest({
      url: '/api/accounting_periods/recount',
      body: { user_id: this.state.userId }
    }).then((response) => {
      this.setState({
        recounting: true
      })
    })
  }

  _renderButtons () {
    const recounting = this.state.recounting;

    if (currentUser.admin) {
      return (
        <div className="btn-toolbar" style={{ marginBottom: '30px' }}>
          <NavLink className="btn btn-default" to={`/accounting_periods/new?user_id=${this.state.userId}`}>{I18n.t('apps.accounting_periods.add')}</NavLink>
          <a id="generate" className="btn btn-default">{I18n.t('apps.accounting_periods.generate_periods')}</a>
          <a id="recount" onClick={this.recountPeriods} className={`btn btn-default ${recounting ? 'disabled' : ''}`}>{I18n.t('apps.accounting_periods.recount_periods')}</a>
        </div>
      )
    }
    return (<div />)
  }

  _renderPagination () {
    let { page, userId, periods } = this.state;
    const total_count = periods.total_count;
    const pages = Math.ceil(total_count / 25);

    page = parseInt(page);

    let isBackAvailable = (page !== 1);
    let isForwardAvailable = (pages > 1 && page !== pages);

    return (
      <ul className="pagination pull-right">
        <li className={!isBackAvailable ? 'disabled' : ''} id="prevPage">
          <a className="glyphicon glyphicon-chevron-left" onClick={this.onPageChange} href={isBackAvailable ? `/accounting_periods?user_id=${userId}&page=${page - 1}`: '#'}></a>
        </li>
        {this.paginationBody(pages, page, userId)}
        <li className={!isForwardAvailable ? 'disabled' : ''} id="nextPage">
          <a className="glyphicon glyphicon-chevron-right" onClick={this.onPageChange} href={isForwardAvailable ? `/accounting_periods?user_id=${userId}&page=${page + 1}` : '#'}></a>
        </li>
      </ul>
    )
  }

  paginationBody (size, page, userId) {
    let li = [];

    for (let i = 1; i < size + 1; i++) {
      li.push(
        <li className={`page ${parseInt(page) === i ? 'active' : ''}`}>
          <a onClick={this.onPageChange} className="page" href={`/accounting_periods?user_id=${userId}&page=${i}`}>{i}</a>
        </li>
      )
    }

    return li;
  }

  onDelete (id) {
    Api.makeDeleteRequest({ url: `/api/accounting_periods/${id}` })
       .then((response) => {
         if (parseInt(response.status) === 204) {
           this.setState({
             periods: {
               accounting_periods: this.state.periods.accounting_periods.filter((period) => (period.id !== id))
             }
           })
         } else {
           alert('Error while trying to remove accounting period');
         }
       })
  }

  _generateMonths () {
    let options = [];

    for (let i = 1; i <= 12; i++) {
      options.push(
        <option value={i}>{i}</option>
      )
    }

    return options;
  }

  _generateYears () {
    let options = [];
    let currentYear = moment().format('YYYY');
    let maxYear = parseInt(currentYear) + 10;

    for (let i = currentYear; i <= maxYear; i++) {
      options.push(
        <option value={i}>{i}</option>
      )
    }

    return options;
  }

  render () {
    const { periods, user, userId, generatePeriods } = this.state;

    return (
      <div>
        {currentUser.admin ? this._renderButtons() : null}
        <div className="col-md-offset-3 col-md-6 vert-offset-bottom clearfix">
          { currentUser.admin ? <h3 className="text-center text-muted">
            {`${user.first_name} ${user.last_name}`}
            <a onClick={this.onPreviousUserChange} className="glyphicon glyphicon-chevron-left pull-left"></a>
            <span>
              <a onClick={this.onNextUserChange} className="glyphicon glyphicon-chevron-right pull-right"></a>
            </span>
          </h3> : null }
        </div>
        <table className="table table-striped">
          <thead>
            <th>{I18n.t('common.position')}</th>
            <th>{I18n.t('common.person')}</th>
            <th>{I18n.t('common.from')}</th>
            <th>{I18n.t('common.to')}</th>
            <th>{I18n.t('common.duration')}</th>
            <th>{I18n.t('apps.accounting_periods.note')}</th>
            <th>{I18n.t('apps.accounting_periods.closed')}</th>
            <th>{I18n.t('apps.accounting_periods.full_time')}</th>
            { currentUser.admin ? <th /> : null }
          </thead>
          <tbody>
            { periods.accounting_periods.map((period, index) => (
              <Period key={index} period={period} onDelete={this.onDelete} userName={userId ? `${user.first_name} ${user.last_name}` : `${currentUser.first_name} ${currentUser.last_name}`} />
            )) }
          </tbody>
        </table>
        {this._renderPagination()}
        <div id="modal" style={{ display: 'none' }}>
          <div className="ui centered-modal modal transition visible active">
            <i className="close icon"></i>
            <div className="header">{I18n.t('apps.accounting_periods.generate_accounting_periods')}</div>
            <div className="content">
              <form className="form ui">
                <div className="error hidden message ui">
                  <p></p>
                </div>
                <div className="fields inline">
                  <div className="field">
                    <label>{I18n.t('apps.accounting_periods.periods_count')}</label>
                    <input type="number" onChange={this.onGeneratePeriodsChange} value={generatePeriods.periods_count} name="periods_count" placeholder="periods count" />
                  </div>
                  <div className="field">
                    <label>{I18n.t('apps.accounting_periods.starting_from_month')}</label>
                    <select onChange={this.onGeneratePeriodsChange} value={generatePeriods.month} className="dropdown ui" id="month" type="text" name="month">
                      {this._generateMonths()}
                    </select>
                  </div>
                  <div className="field">
                    <select onChange={this.onGeneratePeriodsChange} value={generatePeriods.year} className="dropdown ui" id="year" type="text" name="year">
                      {this._generateYears()}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="actions">
              <button onClick={this.onGenerateSubmit} className="button green icon labeled right ui" id="generate" type="button">
                {I18n.t('apps.accounting_periods.generate')}
                <i className="angle double icon right"></i>
              </button>
            </div>
          </div>
          <div className="ui dimmer modals modal-backdrop page transition visible active" style={{ display: 'flex !important' }}></div>
        </div>
      </div>
    )
  }
}

export default Periods;
