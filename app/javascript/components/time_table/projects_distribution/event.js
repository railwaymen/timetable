import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { defaultDatePickerProps } from '../../shared/helpers';
import Dropdown from '../../shared/dropdown';
import * as Api from '../../shared/api';
import * as Loader from './loader';

class Event extends React.Component {
  constructor(props) {
    super(props);

    this.updateProject = this.updateProject.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDateClick = this.onDateClick.bind(this);
    this.state = {
      selectedProject: undefined,
      startsAt: undefined,
      endsAt: undefined,
      resizable: false,
    };
  }

  updateAddModal(startsAt, endsAt) {
    const { projects } = this.props;
    this.setState({
      selectedProject: projects[0],
      startsAt,
      endsAt,
    });
  }

  updateEditModal(event) {
    const { projects } = this.props;
    this.setState({
      selectedProject: projects.filter((p) => p.id === event.projectId)[0],
      startsAt: event.start,
      endsAt: event.end,
      resizable: event.resizable,
    });
  }

  updateProject(selectedProject) {
    this.setState({
      selectedProject,
    });
  }

  filterProjects = (filter) => {
    const lowerFilter = filter.toLowerCase();
    return _.filter(this.props.projects, (p) => (
      p.active && p.name.toLowerCase().match(lowerFilter)
    ));
  }

  renderSelectedProject(selectedObject) {
    return (
      <div>
        <div className="circular empty label ui" style={{ background: `#${selectedObject.color}` }} />
        {selectedObject.name}
      </div>
    );
  }

  renderProjectsList(object, currentObject) {
    return (
      <div>
        <div className="circular empty label ui" style={{ background: `#${object.color}` }} />
        {object.id === currentObject.id ? (
          <b>
            {object.name}
          </b>
        ) : object.name}
      </div>
    );
  }

  onSubmit() {
    Loader.showLoader();
    const {
      selectedProject, startsAt, endsAt,
    } = this.state;

    const params = {
      project_id: selectedProject.id,
      starts_at: startsAt,
      ends_at: endsAt,
      resource_rid: this.props.slotId,
      title: selectedProject.name,
      color: `#${selectedProject.color}`,
    };
    if (this.props.eventInstance) {
      Api.makePutRequest({
        url: `/api/project_resource_assignments/${this.props.eventInstance.id}`,
        body: params,
      }).then((response) => {
        this.props.showUpdatedEvent(response.data);
      }).catch(() => {
        Loader.hideLoader();
      });
    } else {
      Api.makePostRequest({
        url: '/api/project_resource_assignments',
        body: params,
      }).then((response) => {
        this.props.addEvent(response.data);
      }).catch(() => {
        Loader.hideLoader();
      });
    }
  }

  onCloseClick() {
    $('#modal').hide();
  }

  onDeleteClick() {
    const { eventInstance } = this.props;
    this.props.destroyEvent(eventInstance);
  }

  onDateClick(e) {
    const dateName = $(e.target).data('name');
    this.setState({
      [`edit${dateName}`]: true,
    });
  }

  renderDate(dateName) {
    const formatedDate = moment(this.state[dateName]).format('DD/MM/YYYY');
    return (
      <span data-name={dateName} onClick={this.onDateClick}>
        {formatedDate}
      </span>
    );
  }

  onDateChange(dateName, e) {
    this.setState({
      [dateName]: moment(e),
    });
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
    const { slotName, projects, eventInstance } = this.props;
    const { selectedProject, resizable } = this.state;
    const projectColor = selectedProject ? `#${selectedProject.color}` : 'black';
    return (
      <div className="ui centered-modal modal transition visible active">
        <i className="close icon" onClick={this.onCloseClick} />
        <div className="header">{I18n.t(`apps.projects_distribution.${eventInstance ? 'edit_event' : 'add_event'}`)}</div>
        <div className="content">
          <form className="form ui">
            <div className="error hidden message ui">
              <p />
            </div>
            {!eventInstance || (eventInstance && eventInstance.type !== 2) ? (
              <div className="fields add-event">
                <div className="project-field field">
                  <label>{I18n.t('apps.projects.project')}</label>
                  {selectedProject ? (
                    <Dropdown
                      objects={projects}
                      updateObject={this.updateProject}
                      selectedObject={selectedProject}
                      filterObjects={this.filterProjects}
                      renderSelectedObject={this.renderSelectedProject}
                      renderObjectsList={this.renderProjectsList}
                    />
                  ) : null }
                </div>
              </div>
            ) : null }
            <div className="event-info text-center">
              <div className="slot-name">
                {slotName}
              </div>
              <div className="date-range">
                { resizable ? this.renderEditableDate('startsAt') : this.renderDate('startsAt')}
                {' - '}
                { resizable ? this.renderEditableDate('endsAt') : this.renderDate('endsAt')}
              </div>
              <div className="project" style={{ borderColor: projectColor, backgroundColor: projectColor }}>
                {selectedProject ? selectedProject.name : null}
              </div>
            </div>
          </form>
        </div>
        <div className="actions">
          {eventInstance && eventInstance.type !== 2 ? (
            <button className="button red icon labeled right ui" id="generate" type="button" onClick={this.onDeleteClick}>
              {I18n.t('common.destroy')}
              <i className="angle double icon right" />
            </button>
          ) : null}
          <button className="button green icon labeled right ui" id="generate" type="button" onClick={this.onSubmit}>
            {I18n.t(`${eventInstance ? 'common.edit' : 'common.add'}`)}
            <i className="angle double icon right" />
          </button>
        </div>
      </div>
    );
  }
}

export default Event;
