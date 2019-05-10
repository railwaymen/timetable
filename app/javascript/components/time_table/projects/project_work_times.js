import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import URI from 'urijs';
import moment from 'moment';
import * as Api from '../../shared/api';
import { displayDayInfo, displayDuration } from '../../shared/helpers';
import WorkTimeTask from '../../shared/work_time_task';
import WorkTimeDuration from '../../shared/work_time_duration';
import WorkTimeTime from '../../shared/work_time_time';
import WorkTimeTimeDescription from '../../shared/work_time_description';
import HorizontalArrows from '../../shared/horizontal_arrows';
import DateRangeFilter from '../../shared/date_range_filter';

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
    };

    _.bindAll(this, ['getWorkTimes', 'nextWeek', 'prevWeek', 'replaceUrl', 'pushUrl', 'onFromChange', 'onToChange']);
  }

  parseRange() {
    const url = URI(window.location.href);
    const queries = url.search(true);
    const from = (queries.from ? moment(queries.from) : moment().startOf('week')).format();
    const to = (queries.to ? moment(queries.to) : moment().endOf('week')).format();
    return { from, to };
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

  newHistoryState() {
    const { from, to } = this.state;
    const url = URI(window.location.href);
    const newUrl = url.removeSearch('from').removeSearch('to').addSearch({ from, to });
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
    this.getWorkTimes({ from: from.format(), to: from.endOf('week').format() });
  }

  getWorkTimes({ from, to }, stateCallback = this.pushUrl) {
    const url = URI(`/api/projects/${this.state.projectId}/work_times`).addSearch({ from, to });

    Api.makeGetRequest({ url })
      .then((response) => {
        const { project, work_times } = response.data;
        const groupedWorkTimes = _.groupBy(work_times, workTime => (
          moment(workTime.starts_at).format('YYYYMMDD')
        ));
        this.setState({
          project, groupedWorkTimes, from, to,
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
      groupedWorkTimes, from, to, project, projectId,
    } = this.state;
    const dayKeys = Object.keys(groupedWorkTimes).sort((l, r) => r.localeCompare(l));
    return (
      <div className="content-wrapper box">
        <Link to={`/projects/${projectId}/reports`} className="btn btn-success">
          Reports
        </Link>
        <h1 className="center">{project.name}</h1>
        <div className="clearfix col-md-offset-4">
          <HorizontalArrows onLeftClick={this.prevWeek} onRightClick={this.nextWeek}>
            <DateRangeFilter className="pull-left" from={from} to={to} onFromChange={this.onFromChange} onToChange={this.onToChange} onFilter={() => this.getWorkTimes(this.state)} />
          </HorizontalArrows>
        </div>
        {dayKeys.map(dayKey => (
          <section key={dayKey} className="time-entries-day">
            <header>
              <div className="date-container">
                <span className="title">{displayDayInfo(groupedWorkTimes[dayKey][0].starts_at)}</span>
                <span className="super">{displayDuration(_.sumBy(groupedWorkTimes[dayKey], w => w.duration))}</span>
                <div className="time-entries-list-container">
                  <ul className="time-entries-list">
                    {groupedWorkTimes[dayKey].map(workTime => (
                      <li className={`entry ${workTime.updated_by_admin ? 'updated' : ''}`} id={`work-time-${workTime.id}`} key={workTime.id}>
                        <div className="project-container">{`${workTime.user.first_name} ${workTime.user.last_name}`}</div>
                        <div className="description-container" style={{ cursor: 'inherit' }}>
                          <span className="description-text">
                            {WorkTimeTimeDescription(workTime)}
                          </span>
                        </div>
                        <WorkTimeTask workTime={workTime} />
                        <div className="actions-container">
                          {/* .actions-container used here as a separator */}
                        </div>
                        <WorkTimeDuration workTime={workTime} />
                        <WorkTimeTime workTime={workTime} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </header>
          </section>
        ))}
      </div>
    );
  }
}
