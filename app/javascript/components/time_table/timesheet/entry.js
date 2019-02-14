import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ProjectsDropdown from './projects_dropdown.js';
import DatePicker from 'react-datepicker';
import ErrorTooltip from './errors/error_tooltip.js';
import * as Api from '../../shared/api.js';
import * as Validations from '../../shared/validations.js';

class Entry extends React.Component {
  constructor (props) {
    super(props);

    this.lastProject = null;

    this.onChange = this.onChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.recountTime = this.recountTime.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.validate = this.validate.bind(this);
    this.removeErrorsFor = this.removeErrorsFor.bind(this);
    this.paste = this.paste.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  static propTypes = {
    body: PropTypes.string,
    duration: PropTypes.number,
    task: PropTypes.string,
    project: PropTypes.object,
    starts_at: PropTypes.string,
    ends_at: PropTypes.string
  }

  state = {
    body: undefined,
    duration: 0,
    task: '',
    project: {},
    starts_at: moment().format('HH:mm'),
    ends_at: moment().format('HH:mm'),
    durationHours: '00:00',
    date: moment().format('DD/MM/YYYY'),
    errors: []
  }

  onChange (e) {
    let name = e.target.name;

    this.setState({
      [name]: e.target.value
    }, () => { this.removeErrorsFor(name); })
  }

  onKeyPress (e) {
    if (e.key === 'Enter') this.onSubmit();
  }

  onDateChange (e) {
    this.setState({
      date: e.format('DD/MM/YYYY')
    }, () => { this.removeErrorsFor('date'); })
  }

  paste (object) {
    this.setState({
      body: _.unescape(object.body),
      project: object.project,
      project_id: object.project.id,
      task: object.task
    }, () => {
      this.projectsDropdown.assignProject(object.project);
    })
  }

  removeErrorsFor (name) {
    let errors = this.state.errors;
    delete errors[name];
    this.setState({ errors: errors });
  }

  validate () {
    const project = this.state.project;
    const { body, starts_at, ends_at, project_id, duration, task } = this.state;

    if (project.lunch || project.autofill) {
      return []
    } else {
      let errors = {
        body: (!task ? Validations.presence(body) : undefined),
        starts_at: Validations.presence(starts_at),
        ends_at: Validations.presence(ends_at),
        project_id: Validations.presence(project_id),
        duration: Validations.greaterThan(0, duration)
      }
      Object.keys(errors).forEach((key) => { if (errors[key] === undefined) { delete errors[key] } })
      return errors;
    }
  }

  onSubmit () {
    let errors = this.validate();
    let userId = URI(window.location.href).search(true)['user_id'] || currentUser.id;

    if (!_.isEmpty(errors)) {
      this.setState({ errors: errors })
    } else {
      const { body, task, project, date, starts_at, ends_at } = this.state;

      let entryData = {
        user_id: userId,
        body: body,
        task: task,
        project_id: project.id,
        starts_at: moment(`${date} ${starts_at}`, 'DD/MM/YYYY HH:mm'),
        ends_at: moment(`${date} ${ends_at}`, 'DD/MM/YYYY HH:mm')
      }

      Api.makePostRequest({
        url: '/api/work_times',
        body: { work_time: entryData }
      }).then((response) => {
          if (response.data.id) {
            this.props.pushEntry(response.data);
            const newState = {
              body: '',
              task: ''
            };
            if (!this.state.project.autofill) {
              Object.assign(newState, { starts_at: this.state.ends_at, duration: 0, durationHours: '00:00' })
            }
            if (this.lastProject && this.state.project.lunch)
              newState.project = this.lastProject;
            if (!this.state.project.lunch)
              this.lastProject = this.state.project;
            this.setState(newState);
          } else {
            throw new Error("Invalid response");
          }
        }).catch((e) => {
          if (e.errors && (e.errors.starts_at || e.errors.ends_at || e.errors.task)) {
            const errors = {};
            if (e.errors.starts_at || e.errors.ends_at)
              errors.duration = (e.errors.starts_at || []).concat(e.errors.ends_at || [])
            if (e.errors.task)
              errors.task = e.errors.task
            this.setState({ errors });
          } else {
            alert(I18n.t('activerecord.errors.models.work_time.basic'));
          }
        })
    }
  }

  updateProject (project) {
    let autoSettings = {};

    if (project.lunch) {
      autoSettings = {
        ends_at: this.formattedHoursAndMinutes(moment(this.state.starts_at, 'HH:mm').add('30', 'minutes'))
      }
    } else if (project.autofill) {
      autoSettings = {
        starts_at: '09:00',
        ends_at: this.formattedHoursAndMinutes(moment('09:00', 'HH:mm').add('8', 'hours'))
      }
    }

    this.setState({
      ...autoSettings,
      project: project,
      project_id: project.id
    }, () => {
      this.removeErrorsFor('project_id');
      this.recountTime();
    })
  }

  formattedHoursAndMinutes (time) {
    return moment(time).format('HH:mm');
  }

  inclusiveParse(time) {
    const firstFormat = moment(time, 'HH:mm');
    if (firstFormat.isValid()) {
      return firstFormat;
    }

    // Properly handly input without '0' prefix, for example '830' -> 08:30
    return moment(time, 'Hmm');
  }

  recountTime () {
    let formattedStartsAt = this.inclusiveParse(this.state.starts_at)
    let formattedEndsAt   = this.inclusiveParse(this.state.ends_at)

    let duration = this.state.project.count_duration ? moment(formattedEndsAt.diff(formattedStartsAt)) : 0;

    this.setState({
      duration: duration._i,
      durationHours: moment(duration - (60 * 60 * 1000)).format('HH:mm'),
      starts_at: this.formattedHoursAndMinutes(formattedStartsAt),
      ends_at: this.formattedHoursAndMinutes(formattedEndsAt)
    }, () => {
      this.removeErrorsFor('duration')
    })
  }

  onFocus (e) {
    e.target.setSelectionRange(0, e.target.value.length)
  }

  _renderEasterEgg () {
    return _.sample(['https://media.tenor.com/images/cd9b58f5b362c24addbcb904c917ebdb/tenor.gif',
                     'https://media1.tenor.com/images/c10b4e9e6b6d2835b19f42cbdd276774/tenor.gif?itemid=10644609',
                     'https://78.media.tumblr.com/8873748d59f1b6e9ddd5a3fce67c12b4/tumblr_nt0tdjsWg61tpri36o1_400.gif',
                     'https://media.giphy.com/media/11LtzfNXmCQQ80/giphy.gif']);
  }

  render () {
    const { duration, body, task, starts_at, ends_at, durationHours, date, errors, project } = this.state;

    return (
      <div className="new-entry" id="content">
        <div className="timer">
          <div className="segment ui">
            <div className="field">
              <div className="desc">
                { errors.body ? <ErrorTooltip errors={errors.body} /> : null }
                <div className="input transparent ui" onKeyPress={this.onKeyPress}>
                  { project.lunch ?
                      <div className="easter" style={{ 'backgroundImage': `url(${this._renderEasterEgg()})` }}></div>
                    : <textarea className="description auto-focus" placeholder={I18n.t('apps.timesheet.what_have_you_done')} name="body" value={body} onChange={this.onChange}></textarea>
                  }
                </div>
                { project.work_times_allows_task ?
                  <div className="input task-url transparent ui">
                    { errors.task ? <ErrorTooltip errors={errors.task} /> : null }
                    <input className="task" placeholder={I18n.t('apps.timesheet.task_url')} type="text" name="task" value={task} onChange={this.onChange} />
                  </div> : null }
              </div>
              <div className="projects">
                <div className="project-dropdown">
                  { errors.project_id ? <ErrorTooltip errors={errors.project_id} /> : null }
                  <div>
                    <ProjectsDropdown ref={(projectsDropdown) => { this.projectsDropdown = projectsDropdown }} updateProject={this.updateProject} projects={this.props.projects} />
                  </div>
                </div>
              </div>
              <div className="time">
                <div className="input transparent ui">
                  <input className="auto-focus" id="start" type="text" name="starts_at" onChange={this.onChange} onClick={this.onFocus} onBlur={this.recountTime} value={starts_at} />
                </div>
                <span>-</span>
                <div className="input transparent ui">
                  <input className="auto-focus" id="end" type="text" name="ends_at" onChange={this.onChange} onClick={this.onFocus} onBlur={this.recountTime} value={ends_at} />
                </div>
              </div>
              <div className="duration manual">
                { errors.duration ? <ErrorTooltip errors={errors.duration} /> : null }
                <span id="duration">{durationHours}</span>
              </div>
              <div className="date">
                <DatePicker locale="pl" value={moment(date, 'DD/MM/YYYY').format('DD/MM')} format="DD/MM" dateFormat="DD/MM" onChange={this.onDateChange} onSelect={this.onDateChange}/>
              </div>
              <div className="action">
                <button className="btn-start button fluid ui" onClick={this.onSubmit}>{I18n.t('common.save')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Entry;
