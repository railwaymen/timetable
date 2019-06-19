import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import URI from 'urijs';
import ProjectsDropdown from './projects_dropdown';
import TagsDropdown from './tags_dropdown';
import ErrorTooltip from './errors/error_tooltip';
import * as Api from '../../shared/api';
import * as Validations from '../../shared/validations';
import { defaultDatePickerProps } from '../../shared/helpers';

class Entry extends React.Component {
  constructor(props) {
    super(props);

    this.lastProject = null;

    this.onChange = this.onChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.recountTime = this.recountTime.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.updateTag = this.updateTag.bind(this);
    this.validate = this.validate.bind(this);
    this.removeErrorsFor = this.removeErrorsFor.bind(this);
    this.paste = this.paste.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onTimeKeyPress = this.onTimeKeyPress.bind(this);
    this.onTimeFocus = this.onTimeFocus.bind(this);
    this.onTimeBlur = this.onTimeBlur.bind(this);
  }

  static propTypes = {
    body: PropTypes.string,
    duration: PropTypes.number,
    task: PropTypes.string,
    tag: PropTypes.string,
    project: PropTypes.object,
    starts_at: PropTypes.string,
    ends_at: PropTypes.string,
  }

  state = {
    body: undefined,
    duration: 0,
    task: '',
    tag: 'dev',
    project: {},
    starts_at: moment().format('HH:mm'),
    ends_at: moment().format('HH:mm'),
    durationHours: '00:00',
    date: moment().format('DD/MM/YYYY'),
    errors: [],
  }

  onChange(e) {
    const { name } = e.target;

    this.setState({
      [name]: e.target.value,
    }, () => { this.removeErrorsFor(name); });
  }

  onKeyPress(e) {
    if (e.key === 'Enter') this.onSubmit();
  }

  onTimeKeyPress(e) {
    if (e.key === 'Enter') this.recountTime(this.onSubmit);
  }

  preventScroll(e) {
    e = e || window.event;
    e.returnValue = false;
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

  onDateChange(e) {
    this.setState({
      date: e.format('DD/MM/YYYY'),
    }, () => { this.removeErrorsFor('date'); });
  }

  paste(object) {
    this.setState({
      body: _.unescape(object.body),
      project: object.project,
      project_id: object.project.id,
      task: object.task,
      tag: object.tag || 'dev',
    });
  }

  removeErrorsFor(name, stateCallback) {
    this.setState(({ errors }) => {
      delete errors[name];
      return { errors };
    }, stateCallback);
  }

  validate() {
    const { project } = this.state;
    const {
      body, starts_at, ends_at, project_id, duration, task, tag,
    } = this.state;

    if (!project.taggable || project.autofill) {
      return [];
    }
    const errors = {
      body: (!task ? Validations.presence(body) : undefined),
      starts_at: Validations.presence(starts_at),
      ends_at: Validations.presence(ends_at),
      project_id: Validations.presence(project_id),
      duration: Validations.greaterThan(0, duration),
      tag: Validations.presence(tag),
    };
    Object.keys(errors).forEach((key) => { if (errors[key] === undefined) { delete errors[key]; } });
    return errors;
  }

  onSubmit(url) {
    const errors = this.validate();
    const userId = URI(window.location.href).search(true).user_id || currentUser.id;

    if (!_.isEmpty(errors)) {
      this.setState({ errors });
    } else {
      const {
        body, task, tag, project, date, starts_at, ends_at,
      } = this.state;

      const entryData = {
        user_id: userId,
        body,
        task,
        tag: project.taggable ? tag : 'dev',
        project_id: project.id,
        starts_at: moment(`${date} ${starts_at}`, 'DD/MM/YYYY HH:mm'),
        ends_at: moment(`${date} ${ends_at}`, 'DD/MM/YYYY HH:mm'),
      };

      Api.makePostRequest({
        url,
        body: { work_time: entryData },
      }).then((response) => {
        const data = _.castArray(response.data);
        if (!data[0].id) {
          throw new Error('Invalid response');
        }
        data.forEach(this.props.pushEntry);
        const newState = {
          body: '',
          task: '',
          tag: 'dev',
        };
        if (!this.state.project.autofill) {
          Object.assign(newState, { starts_at: this.state.ends_at, duration: 0, durationHours: '00:00' });
        }
        if (this.lastProject && this.state.project.lunch) {
          newState.project = this.lastProject;
          newState.project_id = this.lastProject.id;
        }
        if (!this.state.project.lunch) this.lastProject = this.state.project;
        this.setState(newState);
      }).catch((e) => {
        if (e.errors && (e.errors.starts_at || e.errors.ends_at || e.errors.task)) {
          const newErrors = {};
          if (e.errors.starts_at || e.errors.ends_at) newErrors.duration = (e.errors.starts_at || []).concat(e.errors.ends_at || []);
          if (e.errors.task) newErrors.task = e.errors.task;
          this.setState({ errors: newErrors });
        } else {
          alert(I18n.t('activerecord.errors.models.work_time.basic'));
        }
      });
    }
  }

  updateTag(tag_obj) {
    this.setState({
      tag: tag_obj,
    }, () => {
      this.removeErrorsFor('tag');
      this.recountTime();
    });
  }

  updateProject(project) {
    let autoSettings = {};

    if (project.lunch) {
      autoSettings = {
        ends_at: this.formattedHoursAndMinutes(moment(this.state.starts_at, 'HH:mm').add('30', 'minutes')),
      };
    } else if (project.autofill) {
      autoSettings = {
        starts_at: '09:00',
        ends_at: this.formattedHoursAndMinutes(moment('09:00', 'HH:mm').add('8', 'hours')),
      };
    }

    this.setState({
      ...autoSettings,
      project,
      project_id: project.id,
    }, () => {
      this.removeErrorsFor('project_id');
      this.recountTime();
    });
  }

  formattedHoursAndMinutes(time) {
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

  recountTime(stateCallback) {
    const formattedStartsAt = this.inclusiveParse(this.state.starts_at);
    const formattedEndsAt = this.inclusiveParse(this.state.ends_at);

    const duration = this.state.project.count_duration ? formattedEndsAt.diff(formattedStartsAt) : 0;

    this.setState({
      duration,
      durationHours: moment.utc(duration).format('HH:mm'),
      starts_at: this.formattedHoursAndMinutes(formattedStartsAt),
      ends_at: this.formattedHoursAndMinutes(formattedEndsAt),
    }, () => {
      this.removeErrorsFor('duration', stateCallback);
    });
  }

  onFocus(e) {
    e.target.setSelectionRange(0, e.target.value.length);
  }

  renderEasterEgg() {
    return _.sample(['https://media.tenor.com/images/cd9b58f5b362c24addbcb904c917ebdb/tenor.gif',
      'https://media1.tenor.com/images/c10b4e9e6b6d2835b19f42cbdd276774/tenor.gif?itemid=10644609',
      'https://78.media.tumblr.com/8873748d59f1b6e9ddd5a3fce67c12b4/tumblr_nt0tdjsWg61tpri36o1_400.gif',
      'https://media.giphy.com/media/11LtzfNXmCQQ80/giphy.gif']);
  }

  render() {
    const {
      body, task, tag, starts_at, ends_at, durationHours, date, errors, project,
    } = this.state;

    return (
      <div className="new-entry" id="content">
        <div className="timer">
          <div className="card">
            <div className="row">
              <div className="col-sm-8 col-md-6 description">
                {errors.body ? <ErrorTooltip errors={errors.body} /> : null}
                <div className="form-group">
                  {project.lunch
                    ? <img className="easter" src={this.renderEasterEgg()} alt="" />
                    : <textarea className="form-control" placeholder={I18n.t('apps.timesheet.what_have_you_done')} name="body" value={body} onChange={this.onChange} onKeyPress={this.onKeyPress} />
                  }
                </div>
                {project.work_times_allows_task
                  ? (
                    <div className="form-group">
                      {errors.task ? <ErrorTooltip errors={errors.task} /> : null}
                      <input className="form-control task-url" placeholder={I18n.t('apps.timesheet.task_url')} type="text" name="task" value={task} onChange={this.onChange} onKeyPress={this.onKeyPress} />
                    </div>
                  ) : null}
              </div>
              <div className="col-sm-4 col-md-2 project">
                <div className="project-dropdown">
                  {errors.project_id ? <ErrorTooltip errors={errors.project_id} /> : null}
                  <div>
                    <ProjectsDropdown updateProject={this.updateProject} selectedProject={this.state.project} projects={this.props.projects} />
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-md-4 date">
                <div className="time">
                  <div className="form-group">
                    <input className="form-control" id="start" type="text" name="starts_at" placeholder="830 → 8:30" onKeyPress={this.onTimeKeyPress} onChange={this.onChange} onFocus={this.onTimeFocus} onClick={this.onFocus} onBlur={this.onTimeBlur} value={starts_at} />
                  </div>
                  <span className="time-divider">-</span>
                  <div className="form-group">
                    <input className="form-control" id="end" type="text" name="ends_at" placeholder="1215 → 12:15" onKeyPress={this.onTimeKeyPress} onChange={this.onChange} onFocus={this.onTimeFocus} onClick={this.onFocus} onBlur={this.onTimeBlur} value={ends_at} />
                  </div>
                </div>
                <div className="duration manual">
                  {errors.duration ? <ErrorTooltip errors={errors.duration} /> : null}
                  <span id="duration">{durationHours}</span>
                </div>
                <DatePicker {...defaultDatePickerProps} className="form-control" selected={moment(date, 'DD/MM/YYYY')} value={moment(date, 'DD/MM/YYYY').format('DD/MM')} format="DD/MM" dateFormat="DD/MM" onChange={this.onDateChange} onSelect={this.onDateChange} />
              </div>
            </div>
            { !this.props.tags_disabled && project.taggable && (
              <div className="tag-container">
                {errors.tag && <ErrorTooltip errors={errors.tag} />}
                <TagsDropdown updateTag={this.updateTag} selectedTag={tag} tags={this.props.tags} />
              </div>
            )
            }
            <button type="button" className="bt bt-big bt-main" style={{ marginTop: '5px' }} onClick={() => this.onSubmit('/api/work_times/create_filling_gaps')}>
              {I18n.t('common.fill_save')}
            </button>
            <button type="button" className="bt bt-big bt-main bt-submit" onClick={() => this.onSubmit('/api/work_times')}>
              <i className="symbol fa fa-calendar-plus-o" />
              <span className="bt-txt">{I18n.t('common.save')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Entry;
