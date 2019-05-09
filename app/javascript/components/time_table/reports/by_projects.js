import React from 'react';
import _ from 'lodash';
import { Redirect, NavLink } from 'react-router-dom';
import URI from 'urijs';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReportProjectRecord from './report_project_record';
import * as Api from '../../shared/api';
import Report from './report';
import HorizontalArrows from '../../shared/horizontal_arrows';
import DateRangeFilter from '../../shared/date_range_filter';

class ByProjects extends Report {
  static propTypes = {
    reports: PropTypes.array,
  }

  state = {
    reports: {},
    projects: [],
    from: moment().startOf('month').format(),
    to: moment().endOf('month').format(),
    redirectToReferer: undefined,
    order: 'duration',
  }

  getReports(params = {}) {
    const original = URI(window.location.href);
    let { from, to, order } = params;

    /* eslint-disable */
    if (!from || !to) {
      from = this.state.from;
      to = this.state.to;
    }
    if (!order) order = this.state.order;
    /* eslint-enable */

    const prepareParams = { from, to, sort: order };

    original.removeSearch('from')
      .removeSearch('to');

    const url = URI(`/api/reports/work_times?${original.query()}`)
      .addSearch(prepareParams);

    Api.makeGetRequest({ url })
      .then((response) => {
        const newPath = URI(window.location.href)
          .removeSearch('from')
          .removeSearch('to')
          .removeSearch('sort')
          .addSearch(prepareParams);

        window.history.pushState('Timetable', 'Reports', newPath);

        this.setState({
          reports: _.groupBy(response.data, 'project_name'),
          projects: [],
          from,
          to,
        }, () => {
          this.setState({
            projects: Object.keys(this.state.reports),
          });
        });
      });
  }

  render() {
    const {
      projects, reports, from, to, redirectToReferer, order,
    } = this.state;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />);

    return (
      <div id="content">
        <div className="pull-left">
          <p style={{ padding: '6px' }}>
            {I18n.t('apps.reports.sort_by')}
:
          </p>
          <div className="pull-left">
            <select className="form-control" name="order" onChange={this.onOrderChange} value={order}>
              <option value="duration">{I18n.t('apps.reports.hours')}</option>
              <option value="last_name">{I18n.t('apps.reports.last_name')}</option>
            </select>
          </div>
        </div>
        <h3 className="clearfix col-md-offset-4 text-muted">
          <div className="btn-group pull-right">
            <div className="btn btn-default active">{I18n.t('apps.reports.by_projects')}</div>
            <NavLink className="btn btn-default" to="/reports/work_times/by_users">{I18n.t('apps.reports.by_people')}</NavLink>
          </div>
          <HorizontalArrows onLeftClick={this.prevMonth} onRightClick={this.nextMonth}>
            <div className="current-month pull-left">{this.detectMonth(from, to)}</div>
          </HorizontalArrows>
          <DateRangeFilter className="clearfix" from={from} to={to} onFilter={this.onFilter} onFromChange={this.onFromDateChange} onToChange={this.onToDateChange} />
        </h3>
        {/* eslint-disable */}
        { projects.map((project, index) => (
          <div className="col-md-4">
            <ReportProjectRecord key={index} reportRows={reports[project]} from={from} to={to} redirectTo={this.redirectTo} />
          </div>
        )) }
        {/* eslint-enable */}
        <div className="col-mid-offset-1" />
      </div>
    );
  }
}

export default ByProjects;
