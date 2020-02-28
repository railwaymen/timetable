import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import URI from 'urijs';
import moment from 'moment';
import * as Api from '../../shared/api';
import { displayDayInfo, displayDuration } from '../../shared/helpers';
import WorkTimeDuration from '../../shared/work_time_duration';
import WorkTimeTime from '../../shared/work_time_time';
import WorkTimeTimeDescription from '../../shared/work_time_description';
import HorizontalArrows from '../../shared/horizontal_arrows';
import DateRangeFilter from '../../shared/date_range_filter';
import ReportProjectRecord from '../reports/report_project_record';
import ReportProjectTagRecord from '../reports/report_project_tag_record';

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
      groupedWorkTimes: {},
      reports: [],
      tag_reports: [],
      tags_disabled: false,
    };

    this.filterByUser = this.filterByUser.bind(this);

    _.bindAll(this, ['getWorkTimes', 'nextWeek', 'prevWeek', 'replaceUrl', 'pushUrl', 'onFromChange', 'onToChange', 'allUsers']);
  }

  parseRange() {
    const url = URI(window.location.href);
    const queries = url.search(true);
    const from = (queries.from ? moment(queries.from) : moment().startOf('week')).format();
    const to = (queries.to ? moment(queries.to) : moment().endOf('week')).format();
    const { user_id } = queries;
    return { from, to, user_id };
  }

  componentDidMount() {
    this.getWorkTimes(this.state, this.replaceUrl);
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

  allUsers() {
    this.getWorkTimes({ ...this.state, user_id: undefined });
  }

  newHistoryState() {
    const { from, to, user_id } = this.state;
    const url = URI(window.location.href);
    const newUrl = url.removeSearch('from').removeSearch('to').removeSearch('user_id').addSearch({ from, to, user_id });
    return ['TimeTable', 'TimeTable', newUrl];
  }

  reportsUrl() {
    const { from, to, projectId } = this.state;
    return `/projects/${projectId}/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
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
    this.getWorkTimes({ from: from.format(), to: from.endOf('week').format(), user_id: this.state.user_id });
  }

  getWorkTimes({ from, to, user_id }, stateCallback = this.pushUrl) {
    const url = URI(`/api/projects/${this.state.projectId}/work_times`).addSearch({ from, to, user_id });
    Api.makeGetRequest({ url })
      .then((response) => {
        const {
          project, work_times, reports, tag_reports, tags_disabled,
        } = response.data;
        const groupedWorkTimes = _.groupBy(work_times, (workTime) => (
          moment(workTime.starts_at).format('YYYYMMDD')
        ));
        this.setState({
          project, reports, tag_reports, tags_disabled, groupedWorkTimes, from, to, user_id,
        }, stateCallback);
      });
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

  render() {
    const {
      groupedWorkTimes, from, to, project, reports, tag_reports, tags_disabled,
    } = this.state;
    const dayKeys = Object.keys(groupedWorkTimes).sort((l, r) => r.localeCompare(l));

    return (
      <div className="content-wrapper box">
        <header className="page-header projects-header row text-center">
          <h1 className="project-title">
            {project.name}
            {currentUser.isSuperUser() && (
              <Link to={this.reportsUrl()} className="btn btn-success">
                Reports
              </Link>
            )}
          </h1>
          <HorizontalArrows className="row" onLeftClick={this.prevWeek} onRightClick={this.nextWeek}>
            <DateRangeFilter className="col-md-8 col-md-offset-2" from={from} to={to} onFromChange={this.onFromChange} onToChange={this.onToChange} onFilter={() => this.getWorkTimes(this.state)}>
              <button type="button" className="btn btn-default" onClick={this.allUsers}>
                {I18n.t('apps.reports.all')}
              </button>
            </DateRangeFilter>
          </HorizontalArrows>
        </header>
        <div className="row row-eq-height">
          <div className="col-md-8">
            {dayKeys.map((dayKey) => (
              <section key={dayKey} className="time-entries-day">
                <header>
                  <div className="date-container">
                    <span className="title">{displayDayInfo(groupedWorkTimes[dayKey][0].starts_at)}</span>
                    <span className="super">{displayDuration(_.sumBy(groupedWorkTimes[dayKey], (w) => w.duration))}</span>
                    <div className="time-entries-list-container">
                      <ul className="time-entries-list">
                        {groupedWorkTimes[dayKey].map((workTime) => (
                          <li className={`entry ${workTime.updated_by_admin ? 'updated' : ''}`} id={`work-time-${workTime.id}`} key={workTime.id}>
                            <div className="col-md-2 project-container">{`${workTime.user.first_name} ${workTime.user.last_name}`}</div>
                            <div className="col-md-4 description-container" style={{ cursor: 'inherit' }}>
                              <span className="description-text">
                                {WorkTimeTimeDescription(workTime)}
                              </span>
                            </div>
                            { workTime.tag && !tags_disabled && (
                              <div className="col-md-2 tag-container" style={{ marginTop: '15px' }}>
                                <input disabled className={`tags selected ${workTime.tag}`} type="button" value={workTime.tag.toUpperCase()} />
                              </div>
                            )}
                            <div className="col-md-1">
                              <WorkTimeDuration workTime={workTime} />
                            </div>
                            <div className="col-md-2">
                              <WorkTimeTime workTime={workTime} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </header>
              </section>
            ))}
          </div>
          <div className="col-md-4">
            <div className="sticky-record">
              { !tags_disabled && tag_reports.length > 0 && (
                <div className="row">
                  <ReportProjectTagRecord reportRows={tag_reports} />
                </div>
              )}
              { reports.length > 0 && (
                <div className="row">
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
