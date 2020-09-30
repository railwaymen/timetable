import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import URI from 'urijs';
import ErrorTooltip from '@components/shared/error_tooltip';
import Autocomplete from 'react-autocomplete';
import ProjectsDropdown from './projects_dropdown';
import translateErrors from '../../shared/translate_errors';
import * as Api from '../../shared/api';
import * as Validations from '../../shared/validations';
import { defaultDatePickerProps, formattedHoursAndMinutes, inclusiveParse } from '../../shared/helpers';

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
    this.selectTag = this.selectTag.bind(this);
    this.validate = this.validate.bind(this);
    this.removeErrorsFor = this.removeErrorsFor.bind(this);
    this.paste = this.paste.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onTimeKeyPress = this.onTimeKeyPress.bind(this);
    this.onTimeFocus = this.onTimeFocus.bind(this);
    this.onTimeBlur = this.onTimeBlur.bind(this);
    this.saveWorkTime = this.saveWorkTime.bind(this);

    this.state = {
      body: undefined,
      duration: 0,
      task: '',
      project: {},
      starts_at: moment().format('HH:mm'),
      ends_at: moment().format('HH:mm'),
      durationHours: '00:00',
      date: moment().format('DD/MM/YYYY'),
      combinedTags: [],
      tag: '',
      errors: [],
    };

    this.bodyInputRef = React.createRef();
    this.taskInputRef = React.createRef();
    this.startInputRef = React.createRef();
  }

  onChange(e) {
    const { name } = e.target;

    this.setState({
      [name]: e.target.value,
    }, () => { this.removeErrorsFor(name); });
  }

  onKeyPress(e) {
    if (e.key === 'Enter') this.onSubmit(this.submitPath(e));
  }

  onTimeKeyPress(e) {
    if (e.key !== 'Enter') return;

    const path = this.submitPath(e);
    this.recountTime(() => this.onSubmit(path));
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

  onSubmit(url) {
    const errors = this.validate();
    if (!_.isEmpty(errors)) {
      this.setState({ errors });
    } else {
      this.props.lockRequests(true).then(() => {
        this.saveWorkTime(url);
      });
    }
  }

  onDateChange(date) {
    this.setState({
      date: date.format('DD/MM/YYYY'),
    }, () => { this.removeErrorsFor('date'); });
  }

  onFocus(e) {
    e.target.setSelectionRange(0, e.target.value.length);
  }

  saveWorkTime(url) {
    const userId = URI(window.location.href).search(true).user_id || currentUser.id;
    const {
      body, task, tag, project, date, starts_at, ends_at,
    } = this.state;

    const entryData = {
      user_id: userId,
      body,
      task,
      tag_id: tag.id,
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
      newState.errors = {};
      this.setState(newState);
    }).catch((e) => {
      this.setState({ errors: translateErrors('work_time', e.errors) });
    }).finally(() => {
      this.props.lockRequests(false);
    });
  }

  preventScroll(e) {
    e = e || window.event;
    e.returnValue = false;
  }

  submitPath(e) {
    if (e.ctrlKey) return '/api/work_times/create_filling_gaps';
    return '/api/work_times';
  }

  paste(object) {
    this.setState({
      body: _.unescape(object.body),
      project: object.project,
      project_id: object.project.id,
      task: object.task,
      combinedTags: (object.project.tags || []).concat(this.props.globalTags),
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
      body, starts_at, ends_at, project_id, duration, task,
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
    };
    Object.keys(errors).forEach((key) => { if (errors[key] === undefined) { delete errors[key]; } });
    return errors;
  }

  findDefaultTag() {
    return this.props.globalTags.find((t) => t.use_as_default === true) || this.props.globalTags[0];
  }

  updateTag(tag_obj) {
    this.setState({
      tag: tag_obj,
    }, () => {
      this.removeErrorsFor('tag');
      this.recountTime();
    });
  }

  selectTag(value) {
    this.setState((state) => ({ tag: state.combinedTags.find((tag) => tag.name === value) }));
  }

  updateProject(project, focusPreviousInput) {
    let autoSettings = {};

    if (project.lunch) {
      autoSettings = {
        ends_at: formattedHoursAndMinutes(moment(this.state.starts_at, 'HH:mm').add('30', 'minutes')),
      };
    } else if (project.autofill) {
      autoSettings = {
        starts_at: '09:00',
        ends_at: formattedHoursAndMinutes(moment('09:00', 'HH:mm').add('8', 'hours')),
      };
    }

    this.setState({
      ...autoSettings,
      project,
      combinedTags: project.tags.concat(this.props.globalTags),
      tag: this.findDefaultTag(),
      project_id: project.id,
    }, () => {
      this.removeErrorsFor('project_id');
      this.recountTime();
      if (focusPreviousInput) {
        const { current } = project.work_times_allows_task ? this.taskInputRef : this.bodyInputRef;
        current.focus();
      } else {
        this.focusOnStartInput();
      }
    });
  }

  focusOnStartInput() {
    const { current } = this.startInputRef;
    if (!current) return;
    current.focus();
    current.setSelectionRange(0, current.value.length);
  }

  recountTime(stateCallback) {
    this.setState((prevState) => {
      const formattedStartsAt = inclusiveParse(prevState.starts_at);
      const formattedEndsAt = inclusiveParse(prevState.ends_at);
      const duration = prevState.project.count_duration ? formattedEndsAt.diff(formattedStartsAt) : 0;

      return {
        duration,
        durationHours: moment.utc(duration).format('HH:mm'),
        starts_at: formattedHoursAndMinutes(formattedStartsAt),
        ends_at: formattedHoursAndMinutes(formattedEndsAt),
      };
    }, () => {
      this.removeErrorsFor('duration', stateCallback);
    });
  }

  renderEasterEgg() {
    return _.sample(['https://media.tenor.com/images/cd9b58f5b362c24addbcb904c917ebdb/tenor.gif',
      'https://media1.tenor.com/images/c10b4e9e6b6d2835b19f42cbdd276774/tenor.gif?itemid=10644609',
      'https://78.media.tumblr.com/8873748d59f1b6e9ddd5a3fce67c12b4/tumblr_nt0tdjsWg61tpri36o1_400.gif',
      'https://media.giphy.com/media/11LtzfNXmCQQ80/giphy.gif']);
  }

  render() {
    const {
      body, task, tag, starts_at, ends_at, durationHours, date, errors, project, combinedTags,
    } = this.state;
    const { requestsLocked } = this.props;

    return (
      <div className="new-entry" id="content">
        <div className="timer">
          <div className="card">
            <div className="row">
              <div className="col-sm-8 col-md-6 description">
                {errors.body ? <ErrorTooltip errors={errors.body} /> : null}
                <div className="form-group">
                  {project.lunch ? (
                    <img className="easter" src={this.renderEasterEgg()} alt="" />
                  ) : (
                    <textarea
                      className="form-control"
                      placeholder={I18n.t('apps.timesheet.what_have_you_done')}
                      name="body"
                      value={body}
                      ref={this.bodyInputRef}
                      onChange={this.onChange}
                      onKeyPress={this.onKeyPress}
                    />
                  )}
                </div>
                {project.work_times_allows_task && (
                  <div className="form-group">
                    {errors.task && <ErrorTooltip errors={errors.task} />}
                    <input
                      className="form-control task-url"
                      placeholder={I18n.t('apps.timesheet.task_url')}
                      type="text"
                      name="task"
                      value={task}
                      ref={this.taskInputRef}
                      onChange={this.onChange}
                      onKeyPress={this.onKeyPress}
                    />
                  </div>
                )}
              </div>
              <div className="col-sm-4 col-md-2 project">
                <div className="project-dropdown">
                  {errors.projectId && <ErrorTooltip errors={errors.projectId} />}
                  <div>
                    <ProjectsDropdown updateProject={this.updateProject} selectedProject={this.state.project} projects={this.props.projects} />
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-md-4 date">
                <div className="time">
                  <div className="form-group">
                    <input
                      className="form-control"
                      id="start"
                      type="text"
                      name="starts_at"
                      placeholder="830 → 8:30"
                      ref={this.startInputRef}
                      onKeyPress={this.onTimeKeyPress}
                      onChange={this.onChange}
                      onFocus={this.onTimeFocus}
                      onClick={this.onFocus}
                      onBlur={this.onTimeBlur}
                      value={starts_at}
                    />
                  </div>
                  <span className="time-divider">-</span>
                  <div className="form-group">
                    <input
                      className="form-control"
                      id="end"
                      type="text"
                      name="ends_at"
                      placeholder="1215 → 12:15"
                      onKeyPress={this.onTimeKeyPress}
                      onChange={this.onChange}
                      onFocus={this.onTimeFocus}
                      onClick={this.onFocus}
                      onBlur={this.onTimeBlur}
                      value={ends_at}
                    />
                  </div>
                </div>
                <div className="duration manual">
                  {errors.startsAt && <ErrorTooltip errors={errors.startsAt} />}
                  {errors.duration && <ErrorTooltip errors={errors.duration} />}
                  <span id="duration">{durationHours}</span>
                </div>
                <DatePicker
                  {...defaultDatePickerProps}
                  className="form-control"
                  selected={moment(date, 'DD/MM/YYYY')}
                  value={moment(date, 'DD/MM/YYYY').format('DD/MM')}
                  format="DD/MM"
                  dateFormat="DD/MM"
                  onChange={this.onDateChange}
                  onSelect={this.onDateChange}
                />
              </div>
            </div>
            { project.tags_enabled && (
            <div className="form-group custom-tags">
              <Autocomplete
                inputProps={{ className: 'form-control', placeholder: I18n.t('apps.users.position') }}
                wrapperStyle={{ width: '100%' }}
                getItemValue={(item) => item.name}
                renderItem={(item, isHighlighted) => (
                  <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white', padding: '10px' }}>
                    {item.name}
                  </div>
                )}
                name="tag"
                items={combinedTags}
                value={tag.name}
                onSelect={this.selectTag}
              />
            </div>
            )}
            <div className="form-actions bg-white btn-group">
              <button
                type="button"
                className="btn btn-outline-success btn-lg"
                onClick={() => { if (!requestsLocked) this.onSubmit('/api/work_times/create_filling_gaps'); }}
              >
                <i className="fa fa-calendar-plus-o mr-2" />
                {I18n.t('common.fill_save')}
              </button>
              <button type="button" className="btn btn-success btn-lg" onClick={() => { if (!requestsLocked) this.onSubmit('/api/work_times'); }}>
                <i className="fa fa-calendar-plus-o mr-2" />
                {I18n.t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Entry.propTypes = {
  body: PropTypes.string,
  duration: PropTypes.number,
  task: PropTypes.string,
  tag: PropTypes.string,
  project: PropTypes.object,
  starts_at: PropTypes.string,
  ends_at: PropTypes.string,
};

export default Entry;
