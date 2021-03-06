import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import URI from 'urijs';
import moment from 'moment';
import * as Api from '../../shared/api';
import HorizontalArrows from '../../shared/horizontal_arrows';
import DateRangeFilter from '../../shared/date_range_filter';
import ReportProjectRecord from '../reports/report_project_record';
import WorkTimesReportTable from '../../shared/work_times_report_table';
import ReportProjectTagRecord from '../reports/report_project_tag_record';
import Preloader from '../../shared/preloader';
import Breadcrumb from '../../shared/breadcrumb';

export default class ProjectWorkTimes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.parseRange(),
      project: {
        id: undefined,
        name: undefined,
        color: '0c0c0c',
        leader_id: '',
      },
      projectId: parseInt(this.props.match.params.id, 10),
      work_times: [],
      reports: [],
      crumbs: [],
      tag_reports: [],
      sync: false,
    };

    this.filterByUser = this.filterByUser.bind(this);
    this.filterByTag = this.filterByTag.bind(this);

    _.bindAll(this, ['getWorkTimes', 'nextWeek', 'prevWeek', 'replaceUrl', 'pushUrl', 'onFromChange', 'onToChange', 'clearFilters']);
  }

  componentDidMount() {
    this.getWorkTimes(this.state, this.replaceUrl);
  }

  onFromChange(date) {
    this.setState({
      from: moment(date).format(),
    });
  }

  onToChange(date) {
    this.setState({
      to: moment(date).format(),
    });
  }

  getWorkTimes({
    from, to, user_id, tag_id,
  }, stateCallback = this.pushUrl) {
    const { projectId } = this.state;
    const url = URI(`/api/projects/${projectId}/work_times`).addSearch({
      from, to, user_id, tag_id,
    });
    this.setState({ sync: true });
    Api.makeGetRequest({ url })
      .then((response) => {
        const {
          project, work_times, reports, tag_reports,
        } = response.data;

        const crumbs = [
          { href: '/projects', label: I18n.t('common.projects') },
          { href: `/projects/${projectId}/work_times`, label: project.name },
        ];
        this.setState({
          project, crumbs, reports, tag_reports, work_times, from, to, user_id, tag_id, sync: false,
        }, stateCallback);
      });
  }

  replaceUrl() {
    window.history.replaceState(...this.newHistoryState());
  }

  pushUrl() {
    window.history.pushState(...this.newHistoryState());
  }

  filterByUser(location) {
    const url = URI(location);
    const { user_id } = url.search(true);
    this.getWorkTimes({ ...this.state, user_id });
  }

  filterByTag(location) {
    const url = URI(location);
    const { tag_id } = url.search(true);
    this.getWorkTimes({ ...this.state, tag_id });
  }

  clearFilters() {
    this.getWorkTimes({ ...this.state, user_id: undefined, tag_id: undefined });
  }

  newHistoryState() {
    const {
      from, to, user_id, tag_id,
    } = this.state;
    const url = URI(window.location.href);
    const newUrl = url.removeSearch(['tag_id', 'from', 'to', 'user_id']).addSearch({
      from, to, user_id, tag_id,
    });
    return ['TimeTable', 'TimeTable', newUrl];
  }

  arrowsLabel() {
    return moment(this.state.from).format('MMMM YYYY');
  }

  nextWeek() {
    this.loadWeek(moment(this.state.from).add(1, 'week'));
  }

  prevWeek() {
    this.loadWeek(moment(this.state.from).subtract(1, 'week'));
  }

  loadWeek(from) {
    this.getWorkTimes({ from: from.format(), to: from.endOf('isoWeek').format(), user_id: this.state.user_id });
  }

  parseRange() {
    const url = URI(window.location.href);
    const queries = url.search(true);
    const from = (queries.from ? moment(queries.from) : moment().startOf('isoWeek')).format();
    const to = (queries.to ? moment(queries.to) : moment().endOf('isoWeek')).format();
    const { user_id } = queries;
    return { from, to, user_id };
  }

  render() {
    const {
      work_times, from, to, project, crumbs, reports, tag_reports, user_id, tag_id, sync, projectId,
    } = this.state;

    return (
      <div className="content-wrapper box">
        <Helmet>
          <title>{project.name}</title>
        </Helmet>
        <Breadcrumb crumbs={crumbs} />
        <header className="page-header projects-header text-center">
          <h1 className="project-title">
            {currentUser.isSuperUser() && (
              <div className="btn-group ml-3">
                <Link to={`/projects/${projectId}/reports`} className="btn btn-success">
                  {I18n.t('common.reports')}
                </Link>
                <Link to={`/projects/${projectId}/milestone_reports`} className="btn btn-success">
                  {I18n.t('common.milestone_reports')}
                </Link>
                <Link to={`/projects/${projectId}/milestones`} className="btn btn-success">
                  {I18n.t('common.project_milestones')}
                </Link>
              </div>
            )}
          </h1>
          <HorizontalArrows className="row mx-0" onLeftClick={this.prevWeek} onRightClick={this.nextWeek}>
            <DateRangeFilter
              className="col-auto mx-auto"
              from={from}
              to={to}
              onFromChange={this.onFromChange}
              onToChange={this.onToChange}
              onFilter={() => this.getWorkTimes(this.state)}
            >
              {(user_id || tag_id) && (
                <button type="button" className="btn btn-secondary" onClick={this.clearFilters}>
                  {I18n.t('apps.reports.clear_filters')}
                </button>
              )}
            </DateRangeFilter>
          </HorizontalArrows>
        </header>
        <div className="row row-eq-height">
          {sync && <Preloader rowsNumber={1} />}
          <div className="col-md-8">
            <WorkTimesReportTable
              workTimes={work_times}
            />
          </div>
          <div className="col-md-4">
            <div className="sticky-record">
              { tag_reports.length > 0 && (
                <div className="row mx-0">
                  <ReportProjectTagRecord reportRows={tag_reports} from={from} to={to} user_id={user_id} redirectTo={this.filterByTag} />
                </div>
              )}
              { reports.length > 0 && (
                <div className="row mx-0">
                  <ReportProjectRecord
                    reportRows={reports}
                    from={from}
                    to={to}
                    redirectTo={this.filterByUser}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
