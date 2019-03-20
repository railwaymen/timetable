import React from 'react';
import PropTypes from 'prop-types';
import * as Api from '../../../shared/api.js';
import DatePicker from 'react-datepicker';
import ProjectsList from '../projects_list.js';
import ErrorTooltip from '../errors/error_tooltip.js';
import { preserveLines, defaultDatePickerProps } from '../../../shared/helpers.js';

class WorkHours extends React.Component {
  constructor (props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onCopy = this.onCopy.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this._renderBodyEditable = this._renderBodyEditable.bind(this);
    this._renderDateEditable = this._renderDateEditable.bind(this);
    this.workHoursJsonApi = this.workHoursJsonApi.bind(this);
    this.saveWorkHours = this.saveWorkHours.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.onChangeProject = this.onChangeProject.bind(this);
    this.disableEdit = this.disableEdit.bind(this);
    this.toggleProjectEdit = this.toggleProjectEdit.bind(this);
    this.onHoursEdit = this.onHoursEdit.bind(this);
    this.recountTime = this.recountTime.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
  }

  static propTypes = {
    workHours: PropTypes.object
  }

  state = {
    workHours: this.props.workHours,
    editing: false,
    openModal: false,
    projectEditable: false,
    errors: []
  }

  componentDidMount () {
    this.setState({
      starts_at_hours: this.formattedHoursAndMinutes(this.state.workHours.starts_at),
      ends_at_hours: this.formattedHoursAndMinutes(this.state.workHours.ends_at),
      date: moment(this.state.workHours.starts_at).format('DD/MM/YYYY')
    })
  }

  formattedHoursAndMinutes (time) {
    let hours = moment(time).hours();
    let minutes = moment(time).minutes();
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  formattedHoursAndMinutesDuration (time) {
    time = moment.duration(time, 'seconds');
    let hours = time.hours();
    let minutes = time.minutes();
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  onCopy () {
    this.props.onCopy(this.state.workHours);
  }

  onDelete () {
    if (confirm('Are you sure?')) {
      Api.makeDeleteRequest({ url: `/api/work_times/${this.state.workHours.id}` })
         .then((data) => {
           if (parseInt(data.status) === 204) {
             this.props.removeWorkHours(this);
           }
         })
    }
  }

  onChange (e) {
    this.setState({
      workHours: {
        ...this.state.workHours,
        [e.target.name]: e.target.value
      }
    })
  }

  onChangeProject (e) {
    let projectId = parseInt(e.target.attributes.getNamedItem('data-value').value);
    let project = _.find(this.props.projects, (p) => p.id === projectId);

    if (projectId !== this.state.selectedProject) {
      this.setState({
        workHours: {
          ...this.state.workHours,
          project: project,
          project_id: projectId
        }
      }, () => {
        this.saveWorkHours();
      })
    }
  }

  onHoursEdit (e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  recountTime (e) {
    const { starts_at_hours, ends_at_hours } = this.state;

    let formattedStartsAtTime = this.formattedHoursAndMinutes(moment(starts_at_hours, 'HH:mm'));
    let formattedEndsAtTime = this.formattedHoursAndMinutes(moment(ends_at_hours, 'HH:mm'));

    this.setState({
      starts_at_hours: formattedStartsAtTime,
      ends_at_hours: formattedEndsAtTime
    })
  }

  onDateChange (value) {
    this.setState({
      date: moment(value).format('DD/MM/YYYY')
    })
  }

  _renderBodyEditable () {
    return (
      <div>
        <textarea autoFocus name="body" type="text" value={_.unescape(this.state.workHours.body)} onChange={this.onChange} />
        { this.props.workHours.project.work_times_allows_task ?
          <div className="task-edit">
            <input className="task-input" name="task" value={this.state.workHours.task} onChange={this.onChange} />
          </div> : null }
      </div>
    )
  }

  _renderDateEditable () {
    return (
      <div className="edit-time">
        <input className="start-input" type="text" name="starts_at_hours" value={this.state.starts_at_hours} onChange={this.onHoursEdit} onBlur={this.recountTime} />
        <input className="end-input" type="text" name="ends_at_hours" value={this.state.ends_at_hours} onChange={this.onHoursEdit} onBlur={this.recountTime} />
        <div className="edit-date input ui">
          <DatePicker {...defaultDatePickerProps} value={this.state.date} onChange={this.onDateChange} onSelect={this.onDateChange} />
        </div>
      </div>
    )
  }

  workHoursJsonApi () {
    const workHours = this.state.workHours;

    return {
      id: workHours.id,
      project_id: workHours.project_id,
      body: workHours.body,
      task: workHours.task,
      starts_at: workHours.starts_at,
      ends_at: workHours.ends_at
    }
  }

  disableEdit (e) {
    const localName = e.target.localName;
    const properly = ['textarea', 'input'];

    if (!properly.includes(localName)) {
      document.removeEventListener('click', this.disableEdit);

      this.setState({
        editing: false
      }, () => {
        if (!this.state.editing) {
          this.saveWorkHours();
        }
      })
    }
  }

  toggleEdit () {
    this.setState({
      editing: true,
      errors: []
    }, () => {
      document.addEventListener('click', this.disableEdit);
    })
  }

  toggleProjectEdit (e) {
    let projectEditable = this.state.projectEditable;

    if (!projectEditable) {
      document.addEventListener('click', this.toggleProjectEdit);
    } else {
      document.removeEventListener('click', this.toggleProjectEdit);
    }

    this.setState({
      projectEditable: !projectEditable
    })
  }

  saveWorkHours () {
    const { workHours, ends_at_hours, starts_at_hours, date } = this.state;

    let formattedStartsAtTime = moment(workHours.starts_at).format('HH:mm');
    let formattedEndsAtTime = moment(workHours.ends_at).format('HH:mm');
    let starts_at = moment(`${date} ${starts_at_hours}`, 'DD/MM/YYYY HH:mm');
    let ends_at = moment(`${date} ${ends_at_hours}`, 'DD/MM/YYYY HH:mm');
    let oldDuration = workHours.duration;

    Api.makePutRequest({
      url: `/api/work_times/${this.state.workHours.id}`,
      body: { work_time: { ...this.workHoursJsonApi(), starts_at: starts_at, ends_at: ends_at } }
    }).then((response) => {
      let data = response.data;
      let durationDeviation = data.duration - oldDuration;

      this.setState({
        workHours: data,
        date: moment(data.starts_at).format('DD/MM/YYYY'),
        errors: []
      }, () => {
        this.props.updateWorkHours(this, durationDeviation);
        let event = new CustomEvent(
          'edit-entry',
          { detail: { id: workHours.id, success: true } }
        )

        document.dispatchEvent(event);
      });
    }).catch((e) => {
      this.setState({
        starts_at_hours: formattedStartsAtTime,
        ends_at_hours: formattedEndsAtTime,
        errors: Object.values(e.errors)
      }, () => {
        let event = new CustomEvent(
          'edit-entry',
          { detail: { id: workHours.id, success: false } }
        )

        document.dispatchEvent(event);
      })
    })
  }

  getInfo () {
    this.props.assignModalInfo(undefined);

    return Api.makeGetRequest({ url: `/api/work_times/${this.state.workHours.id}` })
              .then((response) => this.props.assignModalInfo(response.data))
  }

  descriptionText() {
    const { workHours, editing } = this.state;
    if (editing) {
      return null;
    }
    return (
      <span className="description-text">
        {
          workHours.project.lunch ?
          'Omnonmonmonmnomnonmonmn' :
          preserveLines((_.unescape(workHours.body) || '[No description]'))
        }
      </span>
    );
  }

  render () {
    const { projects } = this.props;
    const { workHours, projectEditable, openModal, editing, starts_at_hours, ends_at_hours, errors } = this.state;

    return (
      <div className="time-entries-list-container" style={!_.isEmpty(errors) ? { 'backgroundColor': '#FF9177', position: 'relative' } : {}}>
        { errors.map((error, index) => (<ErrorTooltip key={index} errors={error} />)) }
        <ul className="time-entries-list">
          <li className={`entry ${workHours.updated_by_admin ? 'updated' : ''}`} id={`work-time-${workHours.id}`}>
            { !_.isEmpty(errors) ? <div className="error-info-container"><i className="glyphicon glyphicon-warning-sign"></i></div> : null }
            <div className="task-container">
              <span className="description-text">
                <a href={workHours.task} target="_blank">{workHours.task_preview}</a>
              </span>
            </div>
            <div className="description-container" onClick={this.toggleEdit}>
              {this.descriptionText()}
              { editing ? this._renderBodyEditable() : null }
            </div>
            <div className="project-container" onClick={this.toggleProjectEdit}>
              <span className="project-pill" style={{ background: '#' + workHours.project.color }}>
                {workHours.project.name}
              </span>
              <div className="projects-region">
                { projectEditable ?
                  <div>
                    <div className="dropdown fluid search ui active visible">
                      <input type="hidden" name="project" value="12" />
                      <input className="search" autoComplete="off" tabIndex="0" />
                      <div className="text">
                        <div className="circular empty label ui" style={{ background: '#' + workHours.project.color }}> </div>
                        {workHours.project.name}
                      </div>
                      <ProjectsList projects={projects} currentProject={workHours.project} onChangeProject={this.onChangeProject}/>
                    </div>
                  </div> : null }
              </div>
            </div>
            <div className="actions-container">
              <div className="action-item destroy" onClick={this.onDelete}>
                <i className="icon red trash"></i>
              </div>
              <div className="action-item history" onClick={this.getInfo}>
                <i className="icon wait"></i>
              </div>
              <div className="action-item copy" onClick={this.onCopy}>
                <i className="glyphicon glyphicon-paste"></i>
              </div>
            </div>
            <div className="duration-container">
              <div className="duration">
                {this.formattedHoursAndMinutesDuration(workHours.duration)}
              </div>
            </div>
            <div className="time-container">
              <div className="time" onClick={this.toggleEdit}>
                {starts_at_hours} - {ends_at_hours}
              </div>
              { editing ? this._renderDateEditable() : null }
            </div>
          </li>
        </ul>
      </div>
    )
  }
}

export default WorkHours;
