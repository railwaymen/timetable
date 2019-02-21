import React from 'react';
import Report from './report.js';
import * as Api from '../../shared/api.js';
import _ from 'lodash';
import ReportProjectRecord from './report_project_record.js';
import { Redirect, NavLink } from 'react-router-dom';
import URI from 'urijs';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

class ByProjects extends Report {
  static propTypes = {
    reports: PropTypes.array
  }

  state = {
    reports: {},
    projects: [],
    from: moment().startOf('month').format(),
    to: moment().endOf('month').format(),
    redirectToReferer: undefined,
    order: 'duration'
  }

  getReports (params = {}) {
    let original = URI(window.location.href);
    let queries = original.search(true);
    let { from, to, order } = params;

    if (!from || !to) {
      from = this.state.from;
      to = this.state.to;
    }
    if (!order) order = this.state.order;

    let prepareParams = { from: from, to: to, sort: order };

    original.removeSearch('from')
            .removeSearch('to')

    let url = URI('/api/reports/work_times?' + original.query())
                 .addSearch(prepareParams)

    Api.makeGetRequest({ url: url })
       .then((response) => {
         let newPath = URI(window.location.href)
                          .removeSearch('from')
                          .removeSearch('to')
                          .removeSearch('sort')
                          .addSearch(prepareParams);

         history.pushState('Timetable', 'Reports', newPath)

         this.setState({
           reports: _.groupBy(response.data, 'project_name'),
           projects: [],
           from: from,
           to: to
         }, () => {
           this.setState({
             projects: Object.keys(this.state.reports)
           })
         })
       })
  }

  render () {
    const { projects, reports, from, to, redirectToReferer, order } = this.state;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />)

    return (
      <div id="content">
        <div className="pull-left">
          <p style={{ padding: '6px'}}>{I18n.t('apps.reports.sort_by')}:</p>
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
          <a className="glyphicon glyphicon-chevron-left previous pull-left" href="javascript:void(0)" onClick={this.prevMonth}></a>
          <div className="current-month pull-left">{this.detectMonth(from, to)}</div>
          <a className="glyphicon glyphicon-chevron-right next pull-left" href="javascript:void(0)" onClick={this.nextMonth}></a>
          <div className="clearfix">
            <div className="col-xs-3">
              <DatePicker locale="pl" className="form-control" dateFormat="DD/MM/YYYY" selected={moment(from)} onChange={this.onFromDateChange} name="from" placeholder="from"
                popperModifiers={{ computeStyle: { gpuAcceleration: false } }}/>
            </div>
            <div className="col-xs-3">
              <DatePicker locale="pl" className="form-control" dateFormat="DD/MM/YYYY" selected={moment(to)} onChange={this.onToDateChange} name="to" placeholder="to"
                popperModifiers={{ computeStyle: { gpuAcceleration: false } }}/>
            </div>
            <div className="btn btn-default filter" onClick={this.onFilter}>
              {I18n.t('apps.reports.filter')}
            </div>
          </div>
        </h3>
        { projects.map((project, index) => (
          <ReportProjectRecord key={index} reportRows={reports[project]} from={from} to={to} redirectTo={this.redirectTo} />
        )) }
        <div className="col-mid-offset-1"></div>
      </div>
    )
  }
}

export default ByProjects;
