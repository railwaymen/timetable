import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import ErrorTooltip from '@components/shared/error_tooltip';
import ModalButton from '@components/shared/modal_button';
import ProjectsDropdown from '../projects_dropdown';
import * as Api from '../../../shared/api';
import { defaultDatePickerProps, formattedHoursAndMinutes, inclusiveParse } from '../../../shared/helpers';
import translateErrors from '../../../shared/translate_errors';
import WorkTimeTask from '../../../shared/work_time_task';
import WorkTimeDuration from '../../../shared/work_time_duration';
import WorkTimeTime from '../../../shared/work_time_time';
import WorkTimeDescription from '../../../shared/work_time_description';

class WorkHours extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onCopy = this.onCopy.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.renderBodyEditable = this.renderBodyEditable.bind(this);
    this.renderDateEditable = this.renderDateEditable.bind(this);
    this.workHoursJsonApi = this.workHoursJsonApi.bind(this);
    this.saveWorkHours = this.saveWorkHours.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.disableEdit = this.disableEdit.bind(this);
    this.onHoursEdit = this.onHoursEdit.bind(this);
    this.onTimeFocus = this.onTimeFocus.bind(this);
    this.onTimeBlur = this.onTimeBlur.bind(this);
    this.recountTime = this.recountTime.bind(this);
    this.selectTag = this.selectTag.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onTagChange = this.onTagChange.bind(this);
    this.filterUsers = this.filterUsers.bind(this);
    this.updateProject = this.updateProject.bind(this);

    this.state = {
      workHours: this.props.workHours,
      editing: false,
      errors: [],
    };

    this.searchRef = React.createRef();
    this.tagRef = React.createRef();
  }

  componentDidMount() {
    this.setState((prevState) => ({
      starts_at_hours: moment(prevState.workHours.starts_at).format('HH:mm'),
      ends_at_hours: moment(prevState.workHours.ends_at).format('HH:mm'),
      date: moment(prevState.workHours.starts_at).format('DD/MM/YYYY'),
    }));
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.workHours, this.props.workHours)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ workHours: this.props.workHours });
    }
  }

  onCopy() {
    this.props.onCopy({
      ...this.state.workHours,
      tag: this.state.workHours.tag,
    });
  }

  onDelete() {
    if (window.confirm(I18n.t('common.confirm'))) {
      const { lockRequests } = this.props;
      lockRequests(true).then(() => {
        Api.makeDeleteRequest({ url: `/api/work_times/${this.state.workHours.id}` })
          .then((data) => {
            if (data.status >= 400 && data.status < 500) {
              data.json().then((response) => {
                this.setState({
                  errors: translateErrors('work_time', response.errors),
                });
              });
            } else if (parseInt(data.status, 10) === 204) {
              this.props.removeWorkHours(this);
            }
          })
          .finally(() => {
            lockRequests(false);
          });
      });
    }
  }

  onChange(e) {
    const { name, value } = e.target;

    this.setState((prevState) => ({
      workHours: {
        ...prevState.workHours,
        [name]: value,
      },
    }));
  }

  onHoursEdit(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  onTimeFocus = (e) => {
    document.addEventListener('wheel', this.preventScroll, { passive: false });
    e.target.addEventListener('wheel', this.onTimeWheel);
  }

  onTimeBlur = (e) => {
    this.recountTime();
    e.target.removeEventListener('wheel', this.onTimeWheel);
    document.removeEventListener('wheel', this.preventScroll, false);
  }

  onTimeWheel = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: moment(value, 'HH:mm').subtract(Math.sign(e.deltaY), 'minutes').format('HH:mm'),
    });
  }

  onDateChange(date) {
    this.setState({
      date: moment(date).format('DD/MM/YYYY'),
    });
  }

  onTagChange(tag) {
    this.setState((prevState) => ({
      workHours: {
        ...prevState.workHours,
        tag,
      },
    }), () => {
      this.saveWorkHours();
    });
  }

  getInfo() {
    this.props.assignModalInfo(undefined);

    return Api.makeGetRequest({ url: `/api/work_times/${this.state.workHours.id}` })
      .then((response) => this.props.assignModalInfo(response.data));
  }

  preventScroll(e) {
    e = e || window.event;
    e.returnValue = false;
  }

  formattedHoursAndMinutesDuration(duration) {
    const time = moment.duration(duration, 'seconds');
    let hours = time.hours();
    let minutes = time.minutes();

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  recountTime() {
    const { starts_at_hours, ends_at_hours } = this.state;

    const formattedStartsAtTime = inclusiveParse(starts_at_hours);
    const formattedEndsAtTime = inclusiveParse(ends_at_hours);

    this.setState({
      starts_at_hours: formattedHoursAndMinutes(formattedStartsAtTime),
      ends_at_hours: formattedHoursAndMinutes(formattedEndsAtTime),
    });
  }

  descriptionText() {
    const { workHours, editing } = this.state;
    if (editing) {
      return null;
    }
    return (
      <span className="description-text">
        {
          workHours.project.lunch
            ? 'Omnonmonmonmnomnonmonmn'
            : WorkTimeDescription(workHours)
        }
      </span>
    );
  }

  saveWorkHours() {
    const { lockRequests, updateWorkHours } = this.props;
    lockRequests(true).then(() => {
      const {
        workHours, ends_at_hours, starts_at_hours, date,
      } = this.state;

      const formattedStartsAtTime = moment(workHours.starts_at).format('HH:mm');
      const formattedEndsAtTime = moment(workHours.ends_at).format('HH:mm');
      const starts_at = moment(`${date} ${starts_at_hours}`, 'DD/MM/YYYY HH:mm');
      const ends_at = moment(`${date} ${ends_at_hours}`, 'DD/MM/YYYY HH:mm');
      const oldDuration = workHours.duration;

      Api.makePutRequest({
        url: `/api/work_times/${this.state.workHours.id}`,
        body: {
          work_time: {
            ...this.workHoursJsonApi(), starts_at, ends_at,
          },
        },
      }).then((response) => {
        const { data } = response;
        const durationDeviation = data.duration - oldDuration;

        this.setState({
          workHours: data,
          date: moment(data.starts_at).format('DD/MM/YYYY'),
          errors: [],
        }, () => {
          updateWorkHours(this, durationDeviation);
          const event = new CustomEvent(
            'edit-entry',
            { detail: { id: workHours.id, success: true } },
          );

          document.dispatchEvent(event);
        });
      }).catch((e) => {
        this.setState({
          starts_at_hours: formattedStartsAtTime,
          ends_at_hours: formattedEndsAtTime,
          errors: translateErrors('work_time', e.errors),
        }, () => {
          const event = new CustomEvent(
            'edit-entry',
            { detail: { id: workHours.id, success: false } },
          );

          document.dispatchEvent(event);
        });
      }).finally(() => {
        lockRequests(false);
      });
    });
  }

  toggleEdit() {
    if (this.state.workHours.editable === true) {
      this.setState({
        editing: true,
        errors: [],
      }, () => {
        document.addEventListener('click', this.disableEdit);
      });
    }
  }

  updateProject(project) {
    this.setState((prevState) => ({
      workHours: {
        ...prevState.workHours,
        project,
      },
    }), () => {
      this.saveWorkHours();
    });
  }

  disableEdit(e) {
    const { localName } = e.target;
    const properly = ['textarea', 'input'];

    if (!properly.includes(localName) && !(localName === 'button' && $(e.target).closest('.react-datepicker').length !== 0)) {
      document.removeEventListener('click', this.disableEdit);

      this.setState({
        editing: false,
      }, () => {
        if (!this.state.editing) {
          this.saveWorkHours();
        }
      });
    }
  }

  selectTag(tag) {
    // const id = parseInt(e.target.attributes.getNamedItem('data-value').value, 10);

    this.setState((prevState) => ({
      workHours: {
        ...prevState.workHours,
        tag_id: tag.id,
      },
    }), this.saveWorkHours);
  }

  combinedTags() {
    const {
      workHours,
    } = this.state;

    const project = this.props.projects.find((p) => p.id === workHours.project_id);
    if (project == null) { return this.props.globalTags; }

    return this.props.globalTags.concat(project.tags);
  }

  workHoursJsonApi() {
    const { workHours } = this.state;

    return {
      id: workHours.id,
      body: workHours.body,
      task: workHours.task,
      tag_id: workHours.tag_id,
      project_id: workHours.project.id,
      starts_at: workHours.starts_at,
      ends_at: workHours.ends_at,
    };
  }

  filterUsers(filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(this.combinedTags(), (t) => (t.name.toLowerCase().match(lowerFilter)));
  }

  renderBodyEditable() {
    return (
      <div>
        {/* eslint-disable-next-line */}
        <textarea autoFocus className="form-control" name="body" type="text" placeholder={I18n.t('apps.timesheet.what_have_you_done')} value={_.unescape(this.state.workHours.body)} onChange={this.onChange} />
        { this.props.workHours.project.work_times_allows_task && (
          <div className="task-edit">
            <input
              className="form-control task-input"
              name="task"
              placeholder={I18n.t('apps.timesheet.task_url')}
              value={this.state.workHours.task ? this.state.workHours.task : ''}
              onChange={this.onChange}
            />
          </div>
        )}
      </div>
    );
  }

  renderDateEditable() {
    return (
      <div className="edit-time">
        <div className="edit-date">
          <DatePicker
            {...defaultDatePickerProps}
            disabled={this.state.workHours.project.accounting}
            value={this.state.date}
            onChange={this.onDateChange}
            onSelect={this.onDateChange}
          />
        </div>
        <input
          className="start-input form-control"
          type="text"
          name="starts_at_hours"
          value={this.state.starts_at_hours}
          onChange={this.onHoursEdit}
          onFocus={this.onTimeFocus}
          onClick={this.onFocus}
          onBlur={this.onTimeBlur}
        />
        <span className="time-divider">-</span>
        <input
          className="end-input form-control"
          type="text"
          name="ends_at_hours"
          value={this.state.ends_at_hours}
          onChange={this.onHoursEdit}
          onFocus={this.onTimeFocus}
          onClick={this.onFocus}
          onBlur={this.onTimeBlur}
        />
      </div>
    );
  }

  render() {
    const {
      workHours, editing, errors,
    } = this.state;

    const selectedTag = this.combinedTags().find((t) => t.id === workHours.tag_id) || {};
    const projectsWithoutAccounting = this.props.projects.filter((p) => !p.accounting);

    return (
      <div className={`time-entries-list-container ${!_.isEmpty(errors) ? 'has-error' : ''}`}>
        { Object.values(errors).map((error) => (<ErrorTooltip key={error} errors={error} />)) }
        <ul className="time-entries-list">
          <li
            className={`time-entry time-entry-main entry ${editing ? 'card edit-mode' : ''} ${workHours.updated_by_admin ? 'updated' : ''}`}
            id={`work-time-${workHours.id}`}
          >
            {!_.isEmpty(errors) && <div className="error-info-container"><i className="fa fa-exclamation-circle" /></div>}
            <WorkTimeTask workTime={workHours} />
            <div className="task-content">
              <div className="description-container" onClick={this.toggleEdit}>
                {this.descriptionText()}
                {editing && this.renderBodyEditable()}
              </div>
              <div className="project-container">
                {editing && workHours.project_editable ? (
                  <div className="project-dropdown">
                    <ProjectsDropdown
                      includeColors
                      placeholder={I18n.t('apps.timesheet.select_project')}
                      updateProject={this.updateProject}
                      selectedProject={workHours.project}
                      projects={projectsWithoutAccounting}
                    />
                  </div>
                ) : (
                  <span
                    {...(editing && { 'data-tooltip-bottom': I18n.t('apps.timesheet.project_locked') })}
                    className="project-pill"
                    style={{ background: `#${workHours.project.color}` }}
                  >
                    {workHours.project.name}
                  </span>
                )}
              </div>
              <div className="tag-container">
                {editing && workHours.project.taggable ? (
                  <div className="project-dropdown">
                    <ProjectsDropdown
                      placeholder={I18n.t('apps.timesheet.select_tag')}
                      updateProject={this.selectTag}
                      selectedProject={selectedTag}
                      projects={this.combinedTags()}
                    />
                  </div>
                ) : (
                  <span className="tag-pill">
                    {workHours.tag}
                  </span>
                )}
              </div>
            </div>
            {editing ? (
              this.renderDateEditable()
            ) : (
              <>
                <WorkTimeDuration workTime={workHours} />
                <WorkTimeTime workTime={workHours} onClick={this.toggleEdit} />
              </>
            )}
            <div className="actions-container btn-group">
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={this.onCopy}
                data-tooltip-bottom={I18n.t('common.copy')}
              >
                <i className="fa fa-external-link-square" />
              </button>
              <ModalButton
                id="history"
                btnClass="btn btn-primary btn-sm"
                content={(
                  <i className="fa fa-clock-o" />
                )}
                data-tooltip-bottom={I18n.t('common.history')}
                onClick={this.getInfo}
              />
              { workHours.editable && (
                <button
                  className="btn btn-danger btn-sm"
                  type="button"
                  onClick={this.onDelete}
                  data-tooltip-bottom={I18n.t('common.remove')}
                >
                  <i className="fa fa-trash-o" />
                </button>
              )}
            </div>
          </li>
        </ul>
      </div>
    );
  }
}

WorkHours.propTypes = {
  workHours: PropTypes.object,
};

export default WorkHours;
