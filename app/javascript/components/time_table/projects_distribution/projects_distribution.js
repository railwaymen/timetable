/* eslint-disable react/no-unused-state */
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import ModalButton from '@components/shared/modal_button';
import Scheduler, {
  SchedulerData, ViewTypes, CellUnits, DATE_FORMAT,
} from '../../src/index';
import withDragDropContext from './withDnDContext';
import * as Api from '../../shared/api';
import Modal from './modal';
import Footer from './footer';
import ResourceTooltip from './resource_tooltip';
import * as Loader from './loader';
import 'react-big-scheduler/lib/css/style.css';

class ProjectsDistribution extends React.Component {
  constructor(props) {
    super(props);

    this.onAddResourceClick = this.onAddResourceClick.bind(this);
    this.updateResourcesAndEvents = this.updateResourcesAndEvents.bind(this);
    this.destroyEvent = this.destroyEvent.bind(this);
    this.showSelectedProjects = this.showSelectedProjects.bind(this);
    this.showSelectedUsers = this.showSelectedUsers.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.showUpdatedEvent = this.showUpdatedEvent.bind(this);
    this.state = {
      resources: [],
      activities: [],
      viewModel: undefined,
      users: [],
      projects: [],
      events: [],
      assignedProjectIds: [],
      selectedProjects: [],
      selectedUsers: [],
    };

    moment.locale(currentUser.lang);

    const viewWidth = window.innerWidth;
    let maxSchedulerWidth = '1570';
    if (viewWidth <= 1600) {
      maxSchedulerWidth = '100%';
    }

    const schedulerData = new SchedulerData(
      moment().formatDate(),
      ViewTypes.Custom,
      false,
      false,
      {
        customCellWidth: 22,
        tableHeaderHeight: 60,
        schedulerWidth: maxSchedulerWidth,
        headerEnabled: true,
        resourceName: '',
        views: [],
      },
      {
        getCustomDateFunc: this.getCustomDate,
        isNonWorkingTimeFunc: this.isNonWorkingTime,
      },
      moment,
    );
    this.getData(schedulerData);
  }

  onAddResourceClick() {
    this.modal.showAddResource();
  }

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(this.state.events);
    this.setState({
      viewModel: schedulerData,
    });
  }

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(this.state.events);
    this.setState({
      viewModel: schedulerData,
    });
  }

  getActivities() {
    Api.makeGetRequest({
      url: '/api/project_resources/activity',
    }).then((response) => {
      this.setState({
        activities: response.data,
      });
    });
  }

  getData(schedulerData) {
    const resources_promise = Api.makeGetRequest({
      url: '/api/project_resources',
    });
    const events_promise = Api.makeGetRequest({
      url: '/api/project_resource_assignments',
    });
    const users_promise = Api.makeGetRequest({
      url: '/api/users?filter=active',
    });
    const projects_promise = Api.makeGetRequest({
      url: '/api/projects/simple',
    });
    Promise.all([resources_promise, events_promise, users_promise, projects_promise]).then((values) => {
      const resources = values[0].data;
      const events = values[1].data;
      const users = values[2].data;
      const assignedProjectIds = _.map(events, 'projectId');
      const projects = values[3].data;
      schedulerData.setResources(resources);
      schedulerData.setEvents(events);
      this.setState({
        viewModel: schedulerData,
        events,
        assignedProjectIds,
        resources,
        users,
        projects,
      }, () => {
        this.getActivities();
      });
    });
  }

  getCustomDate = (schedulerData, num, date = undefined) => {
    let selectDate = schedulerData.startDate;
    if (date !== undefined) { selectDate = date; }

    const startDate = schedulerData.localeMoment(selectDate).startOf('month').add(num, 'months').format(DATE_FORMAT);
    const endDate = schedulerData.localeMoment(startDate).add(1, 'months').endOf('month').format(DATE_FORMAT);
    const cellUnit = CellUnits.Day;

    return {
      startDate,
      endDate,
      cellUnit,
    };
  }

  getResourcesAndEvents(schedulerData) {
    const { selectedProjects, selectedUsers } = this.state;
    const selectedUsersIds = selectedUsers.map((u) => u.id);
    const resources_promise = Api.makeGetRequest({
      url: `/api/project_resources?selected_users=${selectedUsersIds}`,
    });
    const url = `/api/project_resource_assignments?selected_projects=${selectedProjects}&selected_users=${selectedUsersIds}`;
    const events_promise = Api.makeGetRequest({ url });
    Promise.all([resources_promise, events_promise]).then((values) => {
      const resources = values[0].data;
      const events = values[1].data;
      const assignedProjectIds = _.map(events, 'projectId');
      schedulerData.setResources(resources);
      schedulerData.setEvents(events);
      this.setState({
        viewModel: schedulerData,
        resources,
        events,
        assignedProjectIds,
      }, () => this.getActivities());
    });
  }

  isNonWorkingTime = (schedulerData, time) => new Date(time).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)

  prevClick = (schedulerData) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    schedulerData.prev();
    schedulerData.setEvents(this.state.events);
    this.setState({
      viewModel: schedulerData,
    });
  }

  nextClick = (schedulerData) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    schedulerData.next();
    schedulerData.setEvents(this.state.events);
    this.setState({
      viewModel: schedulerData,
    });
  }

  eventClicked = (schedulerData, event) => {
    this.modal.showEditEvent(event);
  };

  updateEventStart = (schedulerData, event, newStart) => {
    const params = {
      starts_at: newStart,
    };
    const promise = this.updateEvent(event, params);
    Loader.showLoader();
    promise.then(() => {
      schedulerData.updateEventStart(event, newStart);
      this.updateResourcesAndEvents();
      this.setState({
        viewModel: schedulerData,
      });
    }).catch(() => {
      Loader.hideLoader();
    });
  }

  updateEventEnd = (schedulerData, event, newEnd) => {
    const params = {
      ends_at: newEnd,
    };
    const promise = this.updateEvent(event, params);
    Loader.showLoader();
    promise.then(() => {
      schedulerData.updateEventEnd(event, newEnd);
      this.updateResourcesAndEvents();
      this.setState({
        viewModel: schedulerData,
      });
    }).catch(() => {
      Loader.hideLoader();
    });
  }

  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    const params = {
      resource_rid: slotId,
      starts_at: start,
      ends_at: end,
    };
    const promise = this.updateEvent(event, params);
    Loader.showLoader();
    promise.then(() => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      this.updateResourcesAndEvents();
      this.setState({
        viewModel: schedulerData,
      });
    }).catch(() => {
      Loader.hideLoader();
    });
  }

  newEvent = (schedulerData, slotId, slotName, start, end) => {
    this.modal.showAddEvent(slotId, slotName, start, end);
  }

  nonAgendaCellHeaderTemplateResolver = (schedulerData, item, formattedDateItems, style) => {
    const date = schedulerData.localeMoment(item.time);
    const month = date.format('MM');
    let day = '\u00A0';
    let weekday = '\u00A0';
    const childStyle = {
      color: 'rgb(153, 153, 153)',
    };

    const isEndOfMonth = date.format('D') === moment(date).endOf('month').format('D');

    if (isEndOfMonth) style.borderRight = '1px solid #828282';

    const isMonday = date.isoWeekday() === 1;
    const isFriday = date.isoWeekday() === 5;

    if (isMonday) {
      day = date.format('D');
      weekday = date.format('dd');
    }
    if (isFriday) {
      day = date.format('D');
      weekday = date.format('dd');
    }

    return (
      <th key={item.time} className="header3-text" style={style}>
        <b key={date} style={childStyle}>
          {month}
          <br />
          {day}
          <br />
          {weekday}
        </b>
      </th>
    );
  }

  eventItemTemplateResolver = (schedulerData, event, bgColor, isStart, isEnd, mustAddCssClass, mustBeHeight, agendaMaxEventWidth) => {
    const borderWidth = '0';
    let borderColor = 'rgba(0,139,236,1)';
    let backgroundColor = '#80C5F6';
    let titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, event);

    if (event.type === 1) {
      borderColor = 'rgba(0,139,236,1)';
      backgroundColor = '#80C5F6';
    }
    if (event.type === 2) {
      titleText = '';
      borderColor = '#999';
      backgroundColor = '#D9D9D9';
    }

    let divStyle = { borderLeft: `${borderWidth}px solid ${borderColor}`, backgroundColor, height: mustBeHeight };
    let note = '';

    if (event.note && /^\d+$/.test(event.note[0])) {
      note = event.note.substr(0, 5);
    }

    if (agendaMaxEventWidth) {
      divStyle = { ...divStyle, maxWidth: agendaMaxEventWidth };
    }
    const textDisplay = [note, titleText].join(' ');
    return (
      <div key={event.id} className={mustAddCssClass} style={divStyle}>
        <span style={{ marginLeft: '4px', lineHeight: `${mustBeHeight}px` }}>{textDisplay}</span>
      </div>
    );
  }

  slotClickedFunc = (schedulerData, slot) => {
    const resource = $(`td[data-resource-id='${slot.slotId}'] .slot-text`).first();
    if (resource.length > 0 && !this[`resourceTooltip-${slot.slotId}`]) {
      const tooltipContainer = document.createElement('div');
      tooltipContainer.style.position = 'absolute';
      tooltipContainer.className = slot.slotId;
      resource.append(tooltipContainer);
      ReactDOM.render(
        <ResourceTooltip
          ref={(resourceTooltip) => { this[`resourceTooltip-${slot.slotId}`] = resourceTooltip; }}
          slotName={slot.slotName}
          slotId={slot.slotId}
          updateResourcesAndEvents={this.updateResourcesAndEvents}
        />, resource.find(`div.${slot.slotId}`)[0],
      );
      // eslint-disable-next-line no-restricted-globals
    } else if (event.target.className === 'slot-text') {
      this[`resourceTooltip-${slot.slotId}`].toggleTooltip();
    }
  }

  eventItemPopoverTemplateResolver = (schedulerData, event) => (
    <>
      <h3 className="popover-event-title">
        <div className="circular-label" style={{ background: `${event.bgColor} none repeat scroll 0% 0%` }} />
        {event.title}
      </h3>
      <h4>{event.note}</h4>
      <h5>{`${moment(event.start).formatDate()} - ${moment(event.end).formatDate()}`}</h5>
      <div className="event-buttons">
        <div className="event-delete" onClick={() => this.destroyEvent(event)}>
          {I18n.t('common.destroy')}
        </div>
        <div className="event-edit" onClick={() => this.modal.showEditEvent(event)}>
          {I18n.t('common.edit')}
        </div>
      </div>
    </>
  );

  leftCustomHeader() {
    return (
      <div className="add-resource">
        <ModalButton
          btnClass="btn btn-success bt-submit"
          onClick={this.onAddResourceClick}
          id="resourceModal"
          content={I18n.t('apps.projects_distribution.add_resource')}
        />
      </div>
    );
  }

  updateResourcesAndEvents() {
    this.getResourcesAndEvents(this.state.viewModel);
  }

  addEvent(event) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const schedulerData = this.state.viewModel;
    schedulerData.addEvent(event);
    this.updateResourcesAndEvents();
    this.setState({
      viewModel: schedulerData,
    });
  }

  showUpdatedEvent(event) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const schedulerData = this.state.viewModel;
    schedulerData.removeEventById(event.id);
    schedulerData.addEvent(event);
    this.updateResourcesAndEvents();
    this.setState({
      viewModel: schedulerData,
    });
  }

  updateEvent(event, params) {
    const promise = Api.makePutRequest({
      url: `/api/project_resource_assignments/${event.id}`,
      body: params,
    });
    return promise;
  }

  showSelectedProjects(selectedProjects) {
    if (selectedProjects.length === this.state.selectedProjects.length) { return; }
    const schedulerData = this.state.viewModel;
    const { selectedUsers } = this.state;
    const selectedUsersIds = selectedUsers.map((u) => u.id);
    const url = `/api/project_resource_assignments?selected_projects=${selectedProjects}&selected_users=${selectedUsersIds}`;
    Api.makeGetRequest({
      url,
    }).then((response) => {
      schedulerData.setEvents(response.data);
      this.setState({
        schedulerData,
        events: response.data,
        selectedProjects,
      });
    });
  }

  showSelectedUsers(selectedUsers) {
    const { selectedProjects, viewModel } = this.state;
    const selectedUsersIds = selectedUsers.map((u) => u.id);
    const resources_promise = Api.makeGetRequest({
      url: `/api/project_resources?selected_users=${selectedUsersIds}`,
    });
    const url = `/api/project_resource_assignments?selected_projects=${selectedProjects}&selected_users=${selectedUsersIds}`;
    const events_promise = Api.makeGetRequest({
      url,
    });
    Promise.all([resources_promise, events_promise]).then((values) => {
      const resources = values[0].data;
      const events = values[1].data;
      viewModel.setResources(resources);
      viewModel.setEvents(events);
      this.setState({
        selectedUsers,
        viewModel,
        resources,
        events,
      });
    });
  }

  destroyEvent(event) {
    const schedulerData = this.state.viewModel;
    Loader.showLoader();
    Api.makeDeleteRequest({
      url: `/api/project_resource_assignments/${event.id}`,
    }).then(() => {
      schedulerData.removeEventById(event.id);
      this.updateResourcesAndEvents();
      this.setState({
        viewModel: schedulerData,
      });
    }).catch(() => {
      Loader.hideLoader();
    });
  }

  renderCreateAssignmentActivity(activity) {
    const values = {
      user: this.renderUser(activity.creator_id),
      project: activity.project_name,
      start: moment(activity.starts_at).format('YYYY-MM-DD'),
      end: moment(activity.ends_at).format('YYYY-MM-DD'),
      resource: this.renderUser(activity.user_id),
    };
    return <div>{I18n.t('apps.projects_distribution.activity.create_assignment', values)}</div>;
  }

  renderUpdateAssignmentActivity(activity) {
    const values = {
      user: this.renderUser(activity.creator_id),
      project: activity.project_name,
      start: moment(activity.starts_at).format('YYYY-MM-DD'),
      end: moment(activity.ends_at).format('YYYY-MM-DD'),
      resource: this.renderUser(activity.user_id),
    };
    return <div>{I18n.t('apps.projects_distribution.activity.update_assignment', values)}</div>;
  }

  renderDeleteAssignmentActivity(activity) {
    const values = {
      user: this.renderUser(activity.creator_id),
      project: activity.project_name,
      start: moment(activity.starts_at).format('YYYY-MM-DD'),
      end: moment(activity.ends_at).format('YYYY-MM-DD'),
      resource: this.renderUser(activity.user_id),
    };
    return <div>{I18n.t('apps.projects_distribution.activity.delete_assignment', values)}</div>;
  }

  renderCreateResourceActivity(activity) {
    return <div>{I18n.t('apps.projects_distribution.activity.create_resource', { user: this.renderUser(activity.creator_id), resource: activity.name })}</div>;
  }

  renderUpdateResourceActivity(activity) {
    return <div>{I18n.t('apps.projects_distribution.activity.delete_resource', { user: this.renderUser(activity.creator_id), resource: activity.name })}</div>;
  }

  // eslint-disable-next-line consistent-return
  renderActivity(activity) {
    if (activity.item_type === 'ProjectResource' && activity.event === 'create') return this.renderCreateResourceActivity(activity);
    if (activity.item_type === 'ProjectResource' && activity.event === 'update') return this.renderUpdateResourceActivity(activity);
    if (activity.item_type === 'ProjectResourceAssignment' && activity.event === 'create') return this.renderCreateAssignmentActivity(activity);
    if (activity.item_type === 'ProjectResourceAssignment' && activity.event === 'update' && activity.deleted === true) {
      return this.renderDeleteAssignmentActivity(activity);
    }
    if (activity.item_type === 'ProjectResourceAssignment' && activity.event === 'update') return this.renderUpdateAssignmentActivity(activity);
  }

  renderActivities() {
    const { activities } = this.state;
    return activities.map((activity) => (
      <div key={activity.id}>
        {this.renderActivity(activity)}
      </div>
    ));
  }

  renderUser(id) {
    return this.state.users.find((user) => user.id === id).name;
  }

  render() {
    const {
      assignedProjectIds, viewModel, users, resources, projects, selectedProjects, selectedUsers,
    } = this.state;
    Loader.hideLoader();
    return (
      <>
        {viewModel ? (
          <div className="projects-distribution">
            <Scheduler
              schedulerData={viewModel}
              prevClick={this.prevClick}
              nextClick={this.nextClick}
              onSelectDate={this.onSelectDate}
              onViewChange={this.onViewChange}
              eventItemClick={this.eventClicked}
              updateEventStart={this.updateEventStart}
              updateEventEnd={this.updateEventEnd}
              moveEvent={this.moveEvent}
              newEvent={this.newEvent}
              nonAgendaCellHeaderTemplateResolver={this.nonAgendaCellHeaderTemplateResolver}
              slotClickedFunc={this.slotClickedFunc}
              eventItemPopoverTemplateResolver={this.eventItemPopoverTemplateResolver}
              eventItemTemplateResolver={this.eventItemTemplateResolver}
              leftCustomHeader={this.leftCustomHeader()}
            />
            <Footer
              projects={projects}
              assignedProjectIds={assignedProjectIds}
              showSelectedProjects={this.showSelectedProjects}
              selectedProjects={selectedProjects}
              showSelectedUsers={this.showSelectedUsers}
              selectedUsers={selectedUsers}
            />
          </div>
        ) : (
          'Loading'
        )}

        <div className="scheduler-activity">
          {this.renderActivities()}
        </div>

        <Modal
          ref={(modal) => { this.modal = modal; }}
          users={users}
          projects={projects}
          resources={resources}
          updateResourcesAndEvents={this.updateResourcesAndEvents}
          addEvent={this.addEvent}
          showUpdatedEvent={this.showUpdatedEvent}
          destroyEvent={this.destroyEvent}
        />
      </>
    );
  }
}

export default withDragDropContext(ProjectsDistribution);
