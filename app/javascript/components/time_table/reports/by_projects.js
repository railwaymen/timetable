import React from 'react';
import _ from 'lodash';
import { Redirect, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import URI from 'urijs';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReportProjectRecord from './report_project_record';
import * as Api from '../../shared/api';
import Report from './report';
import HorizontalArrows from '../../shared/horizontal_arrows';
import DateRangeFilter from '../../shared/date_range_filter';
import Preloader from '../../shared/preloader';

class ByProjects extends Report {
  constructor(props) {
    super(props);

    this.state = {
      reports: {},
      projects: [],
      from: moment().startOf('month').format(),
      to: moment().endOf('month').format(),
      redirectToReferer: undefined,
      order: 'duration',
      sync: false,
    };
  }

  getReports(params = {}) {
    const original = URI(window.location.href);
    let { from, to, order } = params;

    if (!from || !to) {
      from = this.state.from;
      to = this.state.to;
    }
    if (!order) order = this.state.order;

    const prepareParams = { from, to, sort: order };

    original.removeSearch('from')
      .removeSearch('to');

    const url = URI(`/api/reports/work_times?${original.query()}`)
      .addSearch(prepareParams);

    this.setState({ sync: true });

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
          this.setState((prevState) => ({
            projects: Object.keys(prevState.reports),
            sync: false,
          }));
        });
      });
  }

  render() {
    const {
      projects, reports, from, to, redirectToReferer, order, sync,
    } = this.state;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />);

    return (
      <div id="content">
        <Helmet>
          <title>{I18n.t('common.reports')}</title>
        </Helmet>
        <header className="page-header reports-header row">
          <div className="col-md-3">
            <p style={{ padding: '6px' }}>
              {I18n.t('apps.reports.sort_by')}
              :
            </p>
            <select className="form-control" name="order" onChange={this.onOrderChange} value={order}>
              <option value="duration">{I18n.t('apps.reports.hours')}</option>
              <option value="last_name">{I18n.t('apps.reports.last_name')}</option>
            </select>
          </div>
          <div className="col-md-6 text-muted text-center">
            <HorizontalArrows onLeftClick={this.prevMonth} onRightClick={this.nextMonth}>
              <h3 className="current-month">{this.detectMonth(from, to)}</h3>
            </HorizontalArrows>
            <DateRangeFilter from={from} to={to} onFilter={this.onFilter} onFromChange={this.onFromDateChange} onToChange={this.onToDateChange} />
          </div>
          <div className="col-md-3">
            <div className="btn-group pull-right">
              <span className="btn btn-default active">{I18n.t('apps.reports.by_projects')}</span>
              <NavLink className="btn btn-default" to="/reports/work_times/by_users">{I18n.t('apps.reports.by_people')}</NavLink>
            </div>
          </div>
        </header>
        {sync && <Preloader rowsNumber={1} />}
        <div className="row row-eq-height">
          { projects.map((project) => (
            <div key={project} className="col-md-4">
              <ReportProjectRecord reportRows={reports[project]} from={from} to={to} redirectTo={this.redirectTo} />
            </div>
          )) }
        </div>
      </div>
    );
  }
}

ByProjects.propTypes = {
  reports: PropTypes.array,
};

export default ByProjects;
