import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import * as Api from '../../../shared/api';
import ProjectsList from '../projects_list';
import TagsDropdown from '../tags_dropdown';
import ErrorTooltip from '../errors/error_tooltip';
import { defaultDatePickerProps } from '../../../shared/helpers';
import WorkTimeTask from '../../../shared/work_time_task';
import WorkTimeDuration from '../../../shared/work_time_duration';
import WorkTimeTag from '../../../shared/work_time_tag';
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
    this.renderTagEditable = this.renderTagEditable.bind(this);
    this.workHoursJsonApi = this.workHoursJsonApi.bind(this);
    this.saveWorkHours = this.saveWorkHours.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.onChangeProject = this.onChangeProject.bind(this);
    this.disableEdit = this.disableEdit.bind(this);
    this.toggleProjectEdit = this.toggleProjectEdit.bind(this);
    this.toggleTagEdit = this.toggleTagEdit.bind(this);
    this.onHoursEdit = this.onHoursEdit.bind(this);
    this.onTimeWheel = this.onTimeWheel.bind(this);
    this.recountTime = this.recountTime.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onTagChange = this.onTagChange.bind(this);
  }

  static propTypes = {
    workHours: PropTypes.object,
  }

  state = {
    workHours: this.props.workHours,
    editing: false,
    projectEditable: false,
    tagEditable: false,
    errors: [],
  }

  componentDidMount() {
    this.setState({
      starts_at_hours: moment(this.state.workHours.starts_at).format('HH:mm'),
      ends_at_hours: moment(this.state.workHours.ends_at).format('HH:mm'),
      date: moment(this.state.workHours.starts_at).format('DD/MM/YYYY'),
    });
  }

  formattedHoursAndMinutesDuration(duration) {
    const time = moment.duration(duration, 'seconds');
    let hours = time.hours();
    let minutes = time.minutes();
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  onCopy() {
    this.props.onCopy({
      ...this.state.workHours,
      tag: this.state.workHours.tag,
    });
  }

  onDelete() {
    if (window.confirm('Are you sure?')) {
      Api.makeDeleteRequest({ url: `/api/work_times/${this.state.workHours.id}` })
        .then((data) => {
          if (parseInt(data.status, 10) === 204) {
            this.props.removeWorkHours(this);
          }
        });
    }
  }

  onChange(e) {
    this.setState({
      workHours: {
        ...this.state.workHours,
        [e.target.name]: e.target.value,
      },
    });
  }

  onChangeProject(e) {
    const projectId = parseInt(e.target.attributes.getNamedItem('data-value').value, 10);
    const project = _.find(this.props.projects, p => p.id === projectId);

    if (projectId !== this.state.selectedProject) {
      this.setState({
        workHours: {
          ...this.state.workHours,
          project,
          project_id: projectId,
        },
      }, () => {
        this.saveWorkHours();
      });
    }
  }

  onHoursEdit(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  onTimeWheel(e) {
    e.preventDefault();
    const { name } = e.target;
    if (e.deltaY < 0) {
      this.setState({
        [name]: moment(e.target.value, 'HH:mm').add(1, 'minutes').format('HH:mm'),
      });
    }
    if (e.deltaY > 0) {
      this.setState({
        [name]: moment(e.target.value, 'HH:mm').subtract(1, 'minutes').format('HH:mm'),
      });
    }
  }

  recountTime() {
    const { starts_at_hours, ends_at_hours } = this.state;

    // parse and reformat as starts_at_hours are input from user
    const formattedStartsAtTime = moment(starts_at_hours, 'HH:mm').format('HH:mm');
    const formattedEndsAtTime = moment(ends_at_hours, 'HH:mm').format('HH:mm');

    this.setState({
      starts_at_hours: formattedStartsAtTime,
      ends_at_hours: formattedEndsAtTime,
    });
  }

  onDateChange(value) {
    this.setState({
      date: moment(value).format('DD/MM/YYYY'),
    });
  }

  onTagChange(tag) {
    if (this.props.tags_disabled) return;

    this.setState({
      workHours: {
        ...this.state.workHours,
        tag,
      },
    }, () => {
      this.saveWorkHours();
    });
  }

  renderBodyEditable() {
    return (
      <div>
        {/* eslint-disable-next-line */}
        <textarea autoFocus className="form-control" name="body" type="text" placeholder={I18n.t('apps.timesheet.what_have_you_done')} value={_.unescape(this.state.workHours.body)} onChange={this.onChange} />
        { this.props.workHours.project.work_times_allows_task
          ? (
            <div className="task-edit">
              <input className="form-control task-input" name="task" placeholder={I18n.t('apps.timesheet.task_url')} value={this.state.workHours.task} onChange={this.onChange} />
            </div>
          ) : null }
      </div>
    );
  }

  renderTagEditable() {
    return (
      <div className="tag-container">
        <TagsDropdown updateTag={this.onTagChange} selectedTag={this.state.workHours.tag} tags={this.props.tags} />
      </div>
    );
  }

  renderDateEditable() {
    return (
      <div className="edit-time">
        <div className="edit-date">
          <DatePicker {...defaultDatePickerProps} value={this.state.date} onChange={this.onDateChange} onSelect={this.onDateChange} />
        </div>
        <input className="start-input form-control" type="text" name="starts_at_hours" value={this.state.starts_at_hours} onChange={this.onHoursEdit} onWheel={this.onTimeWheel} onBlur={this.recountTime} />
        <span className="time-divider">-</span>
        <input className="end-input form-control" type="text" name="ends_at_hours" value={this.state.ends_at_hours} onChange={this.onHoursEdit} onWheel={this.onTimeWheel} onBlur={this.recountTime} />
      </div>
    );
  }

  workHoursJsonApi() {
    const { workHours } = this.state;

    return {
      id: workHours.id,
      project_id: workHours.project_id,
      body: workHours.body,
      task: workHours.task,
      tag: workHours.tag,
      starts_at: workHours.starts_at,
      ends_at: workHours.ends_at,
    };
  }

  disableEdit(e) {
    const { localName } = e.target;
    const properly = ['textarea', 'input'];

    if (!properly.includes(localName)) {
      document.removeEventListener('click', this.disableEdit);

      this.setState({
        editing: false,
        tagEditable: false,
      }, () => {
        if (!this.state.editing) {
          this.saveWorkHours();
        }
      });
    }
  }

  toggleEdit() {
    this.setState({
      editing: true,
      tagEditable: true,
      errors: [],
    }, () => {
      document.addEventListener('click', this.disableEdit);
    });
  }

  toggleProjectEdit() {
    const { projectEditable } = this.state;

    if (!projectEditable) {
      document.addEventListener('click', this.toggleProjectEdit);
    } else {
      document.removeEventListener('click', this.toggleProjectEdit);
    }

    this.setState({
      projectEditable: !projectEditable,
    });
  }

  toggleTagEdit() {
    const { tagEditable } = this.state;

    if (!tagEditable) {
      document.addEventListener('click', this.toggleTagEdit);
    } else {
      document.removeEventListener('click', this.toggleTagEdit);
    }

    this.setState({
      editing: false,
      tagEditable: !tagEditable,
    });
  }

  saveWorkHours() {
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
        this.props.updateWorkHours(this, durationDeviation);
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
        errors: Object.values(e.errors),
      }, () => {
        const event = new CustomEvent(
          'edit-entry',
          { detail: { id: workHours.id, success: false } },
        );

        document.dispatchEvent(event);
      });
    });
  }

  getInfo() {
    this.props.assignModalInfo(undefined);

    return Api.makeGetRequest({ url: `/api/work_times/${this.state.workHours.id}` })
      .then(response => this.props.assignModalInfo(response.data));
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

  render() {
    const { projects, tags_disabled } = this.props;
    const {
      workHours, projectEditable, editing, errors, tagEditable,
    } = this.state;

    return (
      <div className={`time-entries-list-container ${!_.isEmpty(errors) ? 'has-error' : ''}`}>
        {/* eslint-disable-next-line */}
        { errors.map((error, index) => (<ErrorTooltip key={index} errors={error} />)) }
        <ul className="time-entries-list">
          <li className={`time-entry time-entry-main entry ${editing ? 'card edit-mode' : ''} ${workHours.updated_by_admin ? 'updated' : ''}`} id={`work-time-${workHours.id}`}>
            { !_.isEmpty(errors) ? <div className="error-info-container"><i className="fa fa-exclamation-circle" /></div> : null }
            <WorkTimeTask workTime={workHours} />
            <div className="task-content">
              <div className="description-container" onClick={this.toggleEdit}>
                {this.descriptionText()}
                { editing ? this.renderBodyEditable() : null }
              </div>
              <div className="project-container" onClick={this.toggleProjectEdit}>
                <span className="project-pill" style={{ background: `#${workHours.project.color}` }}>
                  {workHours.project.name}
                </span>
                <div className="projects-region">
                  { projectEditable ? (
                    <div>
                      <div className="dropdown fluid search ui active visible">
                        <input type="hidden" name="project" value="12" />
                        <input className="search" autoComplete="off" tabIndex="0" />
                        <div className="text">
                          <div className="circular empty label ui" style={{ background: `#${workHours.project.color}` }} />
                          {workHours.project.name}
                        </div>
                        <ProjectsList projects={projects} currentProject={workHours.project} onChangeProject={this.onChangeProject} />
                      </div>
                    </div>
                  ) : null }
                </div>
              </div>
              { !tags_disabled && workHours.project.taggable && (
              <WorkTimeTag tagEditable={tagEditable} workTime={workHours} onClick={this.toggleTagEdit}>
                { tagEditable && this.renderTagEditable() }
              </WorkTimeTag>
              )
              }
            </div>
            <div className="actions-container">
              <span className="action-item copy" onClick={this.onCopy}>
                <i className="symbol fa fa-external-link-square" />
              </span>
              <span className="action-item history" onClick={this.getInfo}>
                <i className="symbol fa fa-clock-o" />
              </span>
              <span className="action-item destroy" onClick={this.onDelete}>
                <i className="symbol fa fa-trash-o" />
              </span>
            </div>
            {editing ? this.renderDateEditable() : (
              <React.Fragment>
                <WorkTimeDuration workTime={workHours} />
                <WorkTimeTime workTime={workHours} onClick={this.toggleEdit} />
              </React.Fragment>
            )
            }
          </li>
        </ul>
      </div>
    );
  }
}

export default WorkHours;
