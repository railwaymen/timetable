import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import Modal from '@components/shared/modal';
import { defaultDatePickerProps } from '../../shared/helpers';
import CreatableDropdown from '../../shared/creatable_dropdown';
import * as Api from '../../shared/api';
import * as Loader from './loader';

class Event extends React.Component {
  constructor(props) {
    super(props);

    this.updateProject = this.updateProject.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onNoteChange = this.onNoteChange.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDateClick = this.onDateClick.bind(this);
    this.onCreateOption = this.onCreateOption.bind(this);
    this.onSelectOption = this.onSelectOption.bind(this);
    this.getProjectsNames = this.getProjectsNames.bind(this);

    this.state = {
      note: '',
      selectedProject: undefined,
      startsAt: undefined,
      endsAt: undefined,
      resizable: false,
    };
  }

  onSubmit() {
    Loader.showLoader();
    const { showUpdatedEvent, slotId, eventInstance } = this.props;
    const {
      selectedProject, startsAt, endsAt, note,
    } = this.state;

    const params = {
      note,
      project_id: selectedProject.potentialProject ? null : selectedProject.id,
      potential_project_name: selectedProject.potentialProject ? selectedProject.name : null,
      starts_at: startsAt,
      ends_at: endsAt,
      resource_rid: slotId,
      title: selectedProject.name,
      color: `#${selectedProject.color}`,
    };
    const id = eventInstance ? '#editEventModal' : '#addEventModal';
    if (eventInstance) {
      Api.makePutRequest({
        url: `/api/project_resource_assignments/${eventInstance.id}`,
        body: params,
      }).then((response) => {
        $(id).modal('hide');
        showUpdatedEvent(response.data);
      }).catch(() => {
        Loader.hideLoader();
      });
    } else {
      Api.makePostRequest({
        url: '/api/project_resource_assignments',
        body: params,
      }).then((response) => {
        $(id).modal('hide');
        this.props.addEvent(response.data);
      }).catch(() => {
        Loader.hideLoader();
      });
    }
  }

  onDeleteClick() {
    const { eventInstance } = this.props;
    this.props.destroyEvent(eventInstance);
    const id = eventInstance ? '#editEventModal' : '#addEventModal';
    $(id).modal('hide');
  }

  onDateClick(e) {
    const dateName = $(e.target).data('name');
    this.setState({
      [`edit${dateName}`]: true,
    });
  }

  onDateChange(dateName, e) {
    this.setState({
      [dateName]: moment(e),
    });
  }

  onNoteChange(e) {
    this.setState({ note: e.target.value });
  }

  filterProjects = (filter) => {
    const lowerFilter = filter.toLowerCase();
    return _.filter(this.props.projects, (p) => (
      p.active && p.name.toLowerCase().match(lowerFilter)
    ));
  }

  updateAddModal(startsAt, endsAt) {
    const { projects } = this.props;
    this.setState({
      selectedProject: projects[0],
      startsAt,
      endsAt,
      resizable: true,
      note: '',
    });
  }

  updateEditModal(event) {
    const { projects } = this.props;

    const selectedProject = event.projectId
      ? projects.filter((p) => p.id === event.projectId)[0]
      : { potentialProject: true, name: event.potential_project_name };

    this.setState({
      selectedProject,
      startsAt: event.start,
      endsAt: event.end,
      note: event.note || '',
      resizable: event.resizable,
    });
  }

  updateProject(selectedProject) {
    this.setState({
      selectedProject,
    });
  }

  onSelectOption(option) {
    const selectedProject = this.props.projects.find((project) => project.name === option);
    this.setState({ selectedProject });
  }

  onCreateOption(option) {
    const potentialProject = {
      potentialProject: true,
      name: option,
    };
    this.setState({ selectedProject: potentialProject });
  }

  getProjectsNames() {
    return this.props.projects.map((project) => project.name);
  }

  renderDate(dateName) {
    const formatedDate = moment(this.state[dateName]).format('DD/MM/YYYY');
    return (
      <span data-name={dateName} onClick={this.onDateClick}>
        {formatedDate}
      </span>
    );
  }

  renderSelectedProject(selectedObject) {
    return (
      <div>
        <div className="circular-labeli" style={{ background: `#${selectedObject.color}` }} />
        {selectedObject.name}
      </div>
    );
  }

  renderProjectsList(object, currentObject) {
    return (
      <div>
        <div className="circular-label" style={{ background: `#${object.color}` }} />
        {object.id === currentObject.id ? (
          <b>
            {object.name}
          </b>
        ) : object.name}
      </div>
    );
  }

  renderEditableDate(dateName) {
    const date = this.state[dateName];
    return (
      <DatePicker
        {...defaultDatePickerProps}
        className="form-control"
        selected={moment(date, 'YYYY/MM/DD')}
        value={moment(date, 'YYYY/MM/DD').format('DD/MM/YYYY')}
        onChange={(e) => this.onDateChange(dateName, e)}
        onSelect={(e) => this.onDateChange(dateName, e)}
      />
    );
  }

  render() {
    const { slotName, eventInstance } = this.props;
    const { note, selectedProject, resizable } = this.state;
    const projectColor = selectedProject ? `#${selectedProject.color}` : 'black';
    return (
      <Modal
        id={eventInstance ? 'editEventModal' : 'addEventModal'}
        modalClass="modal-lg"
        header={I18n.t(`apps.projects_distribution.${eventInstance ? 'edit_event' : 'add_event'}`)}
        content={(
          <form className="form row mx-0 justify-content-between">
            <div className="error hidden message ui">
              <p />
            </div>
            {!eventInstance || (eventInstance && eventInstance.type !== 2) ? (
              <div className="fields add-event row col">
                <div className="project-field field col">
                  <label>{I18n.t('apps.projects.project')}</label>
                  {selectedProject ? (
                    <CreatableDropdown
                      options={this.getProjectsNames()}
                      onSelectOption={this.onSelectOption}
                      onCreateOption={this.onCreateOption}
                      newOptionLabel={I18n.t('apps.projects.new')}
                    />
                  ) : null}
                </div>
                <div className="field col">
                  <label>{I18n.t('apps.projects.note')}</label>
                  <input onChange={this.onNoteChange} value={note} className="form-control" />
                </div>
              </div>
            ) : null}
            <div className="event-info text-center col">
              <div className="slot-name">
                {slotName}
              </div>
              <div className="date-range">
                {resizable ? this.renderEditableDate('startsAt') : this.renderDate('startsAt')}
                {' - '}
                {resizable ? this.renderEditableDate('endsAt') : this.renderDate('endsAt')}
              </div>
              <div className="project" style={{ borderColor: projectColor, backgroundColor: projectColor }}>
                {selectedProject ? selectedProject.name : null}
              </div>
            </div>
          </form>
        )}
        actions={(
          <>
            {eventInstance && eventInstance.type !== 2 ? (
              <button className="btn btn-danger btn-with-icon" id="generate" type="button" onClick={this.onDeleteClick}>
                <i className="fa fa fa-angle-double-right" />
                {I18n.t('common.destroy')}
              </button>
            ) : null}
            <button className="btn btn-success btn-with-icon" id="generate" type="button" onClick={this.onSubmit}>
              <i className="fa fa fa-angle-double-right" />
              {I18n.t(`${eventInstance ? 'common.edit' : 'common.add'}`)}
            </button>
          </>
        )}
      />
    );
  }
}

export default Event;
