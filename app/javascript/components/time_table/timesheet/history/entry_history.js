import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import URI from 'urijs';
import _ from 'lodash';
import WorkHoursDay from './work_hours_day';
import * as Api from '../../../shared/api';
import { displayDuration } from '../../../shared/helpers';

class EntryHistory extends React.Component {
  constructor(props) {
    super(props);

    this.getWorkHours = this.getWorkHours.bind(this);
    this.pushEntry = this.pushEntry.bind(this);
    this.groupWorkHoursPerDay = this.groupWorkHoursPerDay.bind(this);
    this.totalWorkHours = this.totalWorkHours.bind(this);
    this.removeWorkHours = this.removeWorkHours.bind(this);
    this.decreaseWorkHours = this.decreaseWorkHours.bind(this);
    this.increaseWorkHours = this.increaseWorkHours.bind(this);
    this.assignModalInfo = this.assignModalInfo.bind(this);
    this.updateWorkHours = this.updateWorkHours.bind(this);
    this.onProjectFilter = this.onProjectFilter.bind(this);
    this.onMonthFilter = this.onMonthFilter.bind(this);
    this.formattedDuration = this.formattedDuration.bind(this);
    this.renderFilters = this.renderFilters.bind(this);
    this.renderPeriodInfo = this.renderPeriodInfo.bind(this);
    this.onPreviousUserChange = this.onPreviousUserChange.bind(this);
    this.onNextUserChange = this.onNextUserChange.bind(this);
    this.filterWorkHoursByUser = this.filterWorkHoursByUser.bind(this);
    this.translateTag = this.translateTag.bind(this);
  }

  componentDidMount() {
    moment.locale(currentUser.lang);
    const a = moment().subtract(5, 'years');
    const b = moment().add(1, 'month');
    const months = [];

    for (let m = moment(b); m.isAfter(a); m.subtract(1, 'months')) {
      months.push({ name: m.format('MMM YY'), date: moment(m) });
    }

    this.setState({
      months,
    });

    const linkParams = URI(window.location.href).search(true);
    const filteredUserId = linkParams.user_id;
    let {
      from, to, project_id,
    } = this.state;

    if (linkParams.from && linkParams.to) {
      from = linkParams.from.replace(' ', '+');
      to = linkParams.to.replace(' ', '+');
    }

    // eslint-disable-next-line
    if (linkParams.project_id) project_id = linkParams.project_id;

    if (filteredUserId) {
      this.filterWorkHoursByUser(filteredUserId, {
        from, to, project_id,
      });
    } else {
      this.getWorkHours({
        from, to, project_id,
      });
    }
  }

  static propTypes = {
    workHours: PropTypes.array,
  }

  state = {
    workHours: [],
    daysKeys: [],
    groupedWorkHours: {},
    months: [],
    selectedProject: {},
    filteredUser: undefined,
    project_id: undefined,
    from: moment().startOf('month').format(),
    to: moment().endOf('month').format(),
  }

  filterWorkHoursByUser(id, params) {
    Api.makeGetRequest({ url: `api/users/${id}` })
      .then((response) => {
        this.setState({ filteredUser: response.data }, () => {
          this.getWorkHours(params);
        });
      });
  }

  decreaseWorkHours(seconds) {
    const time = moment.duration(this.state.total, 'hh:mm').subtract(seconds, 'seconds').asMinutes();
    let hours = Math.floor(time / 60);
    let minutes = time % 60;

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    this.setState({
      total: `${hours}:${minutes}`,
    });
  }

  increaseWorkHours(seconds) {
    const time = moment.duration(this.state.total, 'hh:mm').add(seconds, 'seconds').asMinutes();
    let hours = Math.floor(time / 60);
    let minutes = time % 60;

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    this.setState({
      total: `${hours}:${minutes}`,
    });
  }

  removeWorkHours(component, callback) {
    const { fingerPrint } = component.props;

    const { groupedWorkHours } = this.state;
    const day = groupedWorkHours[fingerPrint];
    let { daysKeys } = this.state;

    if (day.length === 1) {
      groupedWorkHours[fingerPrint] = undefined;
      daysKeys = daysKeys.filter(daysKey => daysKey !== fingerPrint);
    } else {
      groupedWorkHours[fingerPrint] = day.filter(record => record.id !== component.state.workHours.id);
    }

    return this.setState({
      groupedWorkHours,
      daysKeys,
    }, () => {
      if (callback) callback();
      this.decreaseWorkHours(component.state.workHours.duration);
    });
  }

  updateWorkHours(component) {
    const { groupedWorkHours } = this.state;

    groupedWorkHours[component.props.fingerPrint] = groupedWorkHours[component.props.fingerPrint].map((w) => {
      if (w.id === component.state.workHours.id) {
        return component.state.workHours;
      }
      return w;
    });

    this.setState({
      groupedWorkHours,
    });
  }

  pushEntry(object) {
    if (moment(object.starts_at).format('MM') === moment(this.state.from).format('MM')) {
      const time = moment(object.starts_at).format('YYYYMMDD');
      const { groupedWorkHours } = this.state;
      const groupedIndex = groupedWorkHours[time];
      let { daysKeys } = this.state;

      if (groupedIndex) {
        groupedWorkHours[time] = _.sortBy(groupedWorkHours[time].concat([object]), t => moment(t.starts_at).format('HHmm')).reverse();
      } else {
        groupedWorkHours[time] = [object];
        daysKeys = _.sortBy(this.state.daysKeys.concat([time]), key => key).reverse();
      }

      this.setState({
        daysKeys,
        groupedWorkHours,
      }, () => {
        this.increaseWorkHours(object.duration);
        const event = new CustomEvent(
          'push-entry',
          { detail: { id: object.id } },
        );

        let lastWorkTime = this.state.workHours[0];
        if (lastWorkTime && lastWorkTime.project.name === 'Lunch') {
          // eslint-disable-next-line
          lastWorkTime = this.state.workHours[1];
          if (lastWorkTime) {
            this.props.setLastProject(lastWorkTime.project || {});
          }
        }

        document.dispatchEvent(event);
      });
    }
  }

  getWorkHours(params = {}) {
    const original = URI(window.location.href);
    const {
      from, to, project_id, pushHistory,
    } = params;

    original.removeSearch('from')
      .removeSearch('to');

    const userId = this.state.filteredUser ? this.state.filteredUser.id : null;
    const prepareParams = {
      from, to, project_id, user_id: userId,
    };

    const url = URI('/api/work_times')
      .addSearch('from', from)
      .addSearch('to', to)
      .addSearch(prepareParams);

    let mandatoryHours;
    let shouldWork;

    Api.makeGetRequest({ url: `/api/accounting_periods/matching_fulltime?date=${moment(from).format('YYYY-MM-DD')}&user_id=${userId || currentUser.id}` })
      .then((results) => {
        const { period } = results.data;

        if (period) {
          const { duration } = period;
          const { should_worked } = results.data;

          mandatoryHours = this.formattedDuration(duration);
          shouldWork = this.formattedDuration(should_worked);
        }
      }).then(() => {
        Api.makeGetRequest({ url })
          .then((response) => {
            this.setState({
              workHours: response.data,
              project_id,
              from,
              to,
              shouldWork,
              mandatoryHours,
            }, () => {
              if (pushHistory) {
                const newPath = URI(window.location.href)
                  .removeSearch('from')
                  .removeSearch('to')
                  .removeSearch('project_id')
                  .removeSearch('user_id')
                  .addSearch(prepareParams);

                window.history.pushState('Timetable', 'Reports', newPath);
              }

              this.groupWorkHoursPerDay();
              this.totalWorkHours();

              let lastWorkTime = this.state.workHours[0];
              if (lastWorkTime && lastWorkTime.project.name === 'Lunch') {
                // eslint-disable-next-line
                lastWorkTime = this.state.workHours[1];
              }

              this.props.setLastProject((lastWorkTime || {}).project);
            });
          });
      });
  }

  renderGroupedRecords() {
    return (
      this.state.daysKeys.map((key, index) => {
        const value = this.state.groupedWorkHours[key];
        /* eslint-disable */
        return (
          <WorkHoursDay
            key={`${index}/${key}/${value}`}
            day={value}
            fingerPrint={key}
            onCopy={this.props.onCopy}
            removeWorkHours={this.removeWorkHours}
            increaseWorkHours={this.increaseWorkHours}
            pushEntry={this.pushEntry}
            projects={this.props.projects}
            tags={this.props.tags}
            tags_disabled={this.props.tags_disabled}
            updateWorkHours={this.updateWorkHours}
            assignModalInfo={this.assignModalInfo}
          />
        );
        /* eslint-enable */
      })
    );
  }

  groupWorkHoursPerDay() {
    if (this.state.workHours.length === 0) {
      this.setState({
        daysKeys: [],
        groupedWorkHours: {},
      });
    } else {
      this.setState({
        daysKeys: [],
        groupedWorkHours: _.groupBy(this.state.workHours, workHours => (
          moment(workHours.starts_at).format('YYYYMMDD')
        )),
      }, () => {
        this.setState({
          daysKeys: _.sortBy(Object.keys(this.state.groupedWorkHours), date => date).reverse(),
        });
      });
    }
  }

  assignModalInfo(info) {
    this.setState({ info });
  }

  totalWorkHours() {
    this.setState({
      total: displayDuration(_.sumBy(this.state.workHours, w => w.duration)),
    });
  }

  onProjectFilter(e) {
    e.preventDefault();

    const projectId = parseInt(e.target.attributes.getNamedItem('data-project-id').value, 10);
    const { from, to } = this.state;

    if (projectId) {
      this.getWorkHours({
        project_id: projectId, pushHistory: true, from, to,
      });
      this.setState({
        selectedProject: _.find(this.props.projects, project => project.id === projectId),
      });
    } else {
      this.getWorkHours({ pushHistory: true, from, to });
      this.setState({
        selectedProject: {},
      });
    }
  }

  onMonthFilter(e) {
    e.preventDefault();

    const month = JSON.parse(e.target.attributes.getNamedItem('data-month').value);
    const from = moment(month.date).startOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
    const to = moment(month.date).endOf('month').format('YYYY-MM-DDTHH:mm:ssZ');

    if (from && to) {
      this.getWorkHours({
        from, to, project_id: this.state.project_id, pushHistory: true,
      });
    } else {
      this.getWorkHours();
    }
  }

  formattedDuration(value) {
    if (!value || parseInt(value, 10) === 0) {
      return '00:00';
    }
    return displayDuration(value);
  }

  translateTag(tag_key) {
    if (tag_key === 'dev') return null;
    return tag_key && I18n.t(`apps.tag.${tag_key}`);
  }

  onPreviousUserChange() {
    const { from, to, project_id } = this.state;

    this.filterWorkHoursByUser(this.state.filteredUser.prev_id, {
      from, to, project_id, pushHistory: true,
    });
  }

  onNextUserChange() {
    const { from, to, project_id } = this.state;

    this.filterWorkHoursByUser(this.state.filteredUser.next_id, {
      from, to, project_id, pushHistory: true,
    });
  }

  renderVersions() {
    /* eslint-disable */
    return (
      this.state.info.versions.map((version, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{moment(version.created_at).format('YYYY-MM-DD HH:mm')}</td>
          <td>{version.updated_by}</td>
          <td>
            { version.project_name
              ? (
                <span className={(version.event === 'update' ? 'changed' : '')}>
                  {version.project_name}
                </span>
              )
              : <span>{version.project_name_was}</span> }
          </td>
          <td>
            { version.body
              ? <span className={(version.event === 'update' ? 'changed' : '')}>{(version.body || '').replace(/\n/g, '<br />')}</span>
              : <span>{(version.body_was || '').replace(/\n/g, '<br />')}</span> }
          </td>
          <td>
            { version.tag
              ? <span className={(version.event === 'update' ? 'changed' : '')}>{this.translateTag(version.tag)}</span>
                : <span>{this.translateTag(version.tag_was)}</span> }
          </td>
          <td>
            { version.starts_at
              ? <span className={(version.event === 'update' ? 'changed' : '')}>{moment(version.starts_at).format('HH:mm')}</span>
              : <span>{moment(version.starts_at_was).format('HH:mm')}</span> }
          </td>
          <td>
            { version.ends_at
              ? <span className={(version.event === 'update' ? 'changed' : '')}>{moment(version.ends_at).format('HH:mm')}</span>
              : <span>{moment(version.ends_at_was).format('HH:mm')}</span> }
          </td>
          <td>
            { version.duration
              ? <span className={(version.event === 'update' ? 'changed' : '')}>{this.formattedDuration(version.duration)}</span>
              : <span>{this.formattedDuration(version.duration_was)}</span> }
          </td>
        </tr>
      ))
    );
    /* eslint-enable */
  }

  renderPeriodInfo() {
    const { total, shouldWork, mandatoryHours } = this.state;

    if (mandatoryHours && shouldWork) {
      return (
        <div className="duration">
          <span className="work-time">{total}</span>
          /
          {shouldWork}
          <span className="icon ui" data-toggle="tooltip" title={I18n.t('apps.timesheet.required_duration_until_end_of_day')}>
            <i className="circle help icon small" />
          </span>
          /
          {mandatoryHours}
          <span className="icon ui" data-toggle="tooltip" title={I18n.t('apps.timesheet.required_duration_until_end_of_month')}>
            <i className="circle help icon small" />
          </span>
        </div>
      );
    }
    return (
      <div className="duration">
        <span className="work-time">{total}</span>
      </div>
    );
  }

  renderFilters() {
    /* eslint-disable */
    const { projects } = this.props;
    const { months, from, selectedProject } = this.state;
    return (
      <div>
        <div id="months" className="button dropdown right floated scrolling teal ui" tabIndex="0">
          <div className="text">{moment(from).format('MMMM') || I18n.t('apps.timesheet.select_month')}</div>
          <i className="dropdown icon" />
          <div className="menu" tabIndex="-1">
            { months.map((month, index) => (
              <a key={index} className="item" data-month={JSON.stringify(month)} onClick={this.onMonthFilter} href={`/timesheet?project_id=${month.date}`}>
                {month.name}
              </a>
            )) }
          </div>
        </div>
        <div className="button dropdown right floated scrolling teal ui" tabIndex="0">
          <div className="text">{selectedProject.name ? selectedProject.name : I18n.t('apps.timesheet.select_project')}</div>
          <i className="dropdown icon" />
          <div className="menu" tabIndex="-1">
            <a className="item" data-project-id="" href="" onClick={this.onProjectFilter}>{I18n.t('common.all')}</a>
            { projects.map((project, index) => (
              <a onClick={this.onProjectFilter} data-project-id={project.id} className="item" key={index} href={`/timesheet?project_id=${project.id}`}>{project.name}</a>
            )) }
          </div>
        </div>
      </div>
    );
    /* eslint-enable */
  }

  renderTaskDuration() {
    const { info } = this.state;
    if (!info || !info.task_preview) return null;
    return (
      <p>
        {`${info.task_preview}: ${displayDuration(info.sum_duration)}`}
      </p>
    );
  }

  render() {
    const { info, filteredUser } = this.state;

    return (
      <div className="content-wrapper">
        { currentUser.isSuperUser() && filteredUser
          ? (
            <h1 className="active-user-timesheet">
              { filteredUser.prev_id
                ? <a onClick={this.onPreviousUserChange} className="glyphicon glyphicon-chevron-left pull-left" /> : null }
              {currentUser.fullName.apply(filteredUser)}
              { filteredUser.next_id
                ? <a onClick={this.onNextUserChange} className="glyphicon glyphicon-chevron-right pull-right" /> : null }
            </h1>
          )
          : null }
        <div id="time-entry-list">
          <div className="select-month">
            <h3>
              {I18n.t('apps.timesheet.overall_work_time')}
              {this.renderPeriodInfo()}
            </h3>
            {this.renderFilters()}
          </div>
          <div className="box">
            <div>
              {this.renderGroupedRecords()}
            </div>
          </div>
        </div>
        <div className="ui dimmer modal-backdrop modals page transition" id="modal-info" style={{ display: 'none; !important' }}>
          <div className="ui centered-modal modal transition visible active" style={{ display: 'none !important' }}>
            <div className="header">
              { info ? info.body : <div className="preloader" /> }
            </div>
            <div className="content">
              <table className="history table table-striped">
                <tbody>
                  { this.state.info ? this.renderVersions()
                    : (
                      <tr>
                        <td><div className="preloader" /></td>
                        <td><div className="preloader" /></td>
                        <td><div className="preloader" /></td>
                        <td><div className="preloader" /></td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
              {
                this.renderTaskDuration()
              }
            </div>
            <div className="actions">
              <button className="button cancel right ui" type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EntryHistory;
