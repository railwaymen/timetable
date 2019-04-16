import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Redirect, NavLink } from 'react-router-dom';
import URI from 'urijs';
import PropTypes from 'prop-types';
import ReportUserRecord from './report_user_record';
import * as Api from '../../shared/api';
import Report from './report';
import HorizontalArrows from '../../shared/horizontal_arrows';
import DateRangeFilter from '../../shared/date_range_filter';

class ByUsers extends Report {
  static propTypes = {
    reports: PropTypes.array,
    users: PropTypes.array,
    from: PropTypes.string,
    to: PropTypes.string,
    redirectToReferer: PropTypes.string,
    list: PropTypes.string,
  }

  state = {
    reports: {},
    users: [],
    from: moment().startOf('month').format(),
    to: moment().endOf('month').format(),
    redirectToReferer: undefined,
    list: 'self',
  }

  getReports(params = {}) {
    const original = URI(window.location.href);
    let { from, to, list } = params;

    /* eslint-disable */
    if (!from || !to) {
      from = this.state.from;
      to = this.state.to;
    }

    if (!list) {
      list = this.state.list;
    }
    /* eslint-enable */

    const prepareParams = { from, to, list };

    original.removeSearch('from')
      .removeSearch('to')
      .removeSearch('list');

    const url = URI(`/api/reports/work_times/by_users?${original.query()}`)
      .addSearch(prepareParams);

    Api.makeGetRequest({ url })
      .then((response) => {
        const newPath = URI(window.location.href)
          .removeSearch('from')
          .removeSearch('to')
          .removeSearch('list')
          .addSearch(prepareParams);

        window.history.pushState('Timetable', 'Reports', newPath);

        this.setState({
          reports: _.groupBy(response.data, 'user_name'),
          users: [],
          from,
          to,
          list,
        }, () => {
          this.setState({
            users: Object.keys(this.state.reports),
          });
        });
      });
  }

  render() {
    const {
      users, reports, from, to, redirectToReferer, list,
    } = this.state;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />);

    return (
      <div id="content">
        <div className="pull-left">
          { (currentUser.isSuperUser() || currentUser.is_leader)
            ? (
              <select id="filter-list" className="form-control" name="list" onChange={this.onFilterChange} defaultValue={list}>
                { currentUser.isSuperUser()
                  ? <option value="all">{I18n.t('apps.reports.all')}</option> : null }
                { currentUser.is_leader
                  ? <option value="leader">{I18n.t('apps.reports.my_projects')}</option> : null }
                <option value="self">{I18n.t('apps.reports.my_work_hours')}</option>
              </select>
            ) : null }
        </div>
        <h3 className="clearfix col-md-offset-4 text-muted">
          { (currentUser.isSuperUser() || currentUser.is_leader)
            ? (
              <div className="btn-group pull-right">
                <NavLink className="btn btn-default" to="/reports/work_times/by_projects">{I18n.t('apps.reports.by_projects')}</NavLink>
                <div className="btn btn-default active">{I18n.t('apps.reports.by_people')}</div>
              </div>
            ) : null }

          <HorizontalArrows onLeftClick={this.prevMonth} onRightClick={this.nextMonth}>
            <div className="current-month pull-left">{this.detectMonth(from, to)}</div>
          </HorizontalArrows>
          <DateRangeFilter className="clearfix" from={from} to={to} onFilter={this.onFilter} onFromChange={this.onFromDateChange} onToChange={this.onToDateChange} />
        </h3>
        {/* eslint-disable */}
        { users.map((user, index) => (
          <ReportUserRecord key={index} reportRows={reports[user]} from={from} to={to} redirectTo={this.redirectTo} />
        )) }
        {/* eslint-enable */}
        <div className="col-mid-offset-1" />
      </div>
    );
  }
}

export default ByUsers;
