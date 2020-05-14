/* eslint-disable react/no-unused-state */
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import tinycolor from 'tinycolor2';
import ReactDOM from 'react-dom';
import Scheduler, {
  SchedulerData, ViewTypes, CellUnits, DATE_FORMAT,
} from '../../src/index';
import withDragDropContext from './withDnDContext';
import * as Api from '../../shared/api';
import Modal from './modal';
import Footer from './footer';
import ResourceTooltip from './resource_tooltip';
import * as Loader from './loader';

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
      schedulerHeader: null,
      selectedProjects: [],
      selectedUsers: [],
    };
  }

  componentDidMount() {
    const schedulerData = new SchedulerData(
      moment().format(DATE_FORMAT),
      ViewTypes.Custom,
      false,
      false,
      {
        displayWeekend: false,
        customCellWidth: '1.3%',
        besidesWidth: '30',
        schedulerMaxHeight: '0',
        tableHeaderHeight: '55px',
        headerEnabled: false,
        resourceName: '',
        views: [
          {
            viewName: 'Three months',
            viewType: ViewTypes.Custom,
            showAgenda: false,
            isEventPerspective: false,
          },
        ],
      },
      { getCustomDateFunc: this.getCustomDate },
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
    }, () => {
      this.setState({
        schedulerHeader: this.schedulerHeader(),
      });
    });
  }

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(this.state.events);
    this.setState({
      viewModel: schedulerData,
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
    const activity_promise = Api.makeGetRequest({
      url: '/api/project_resources/activity',
    });
    Promise.all([resources_promise, events_promise, users_promise, projects_promise, activity_promise]).then((values) => {
      const resources = values[0].data;
      const events = values[1].data;
      const users = values[2].data;
      const assignedProjectIds = _.map(events, 'projectId');
      const projects = values[3].data;
      const activities = values[4].data;
      schedulerData.setResources(resources);
      schedulerData.setEvents(events);
      this.setState({
        viewModel: schedulerData,
        events,
        assignedProjectIds,
        resources,
        users,
        projects,
        activities,
      }, () => {
        this.setState({
          schedulerHeader: this.schedulerHeader(),
        });
      });
    });
  }

  getCustomDate = (schedulerData, num, date = undefined) => {
    let selectDate = schedulerData.startDate;
    if (date !== undefined) { selectDate = date; }

    const firstDayOfMonth = schedulerData.localeMoment(selectDate).startOf('month').format(DATE_FORMAT);
    const startDate = num === 0 ? firstDayOfMonth : schedulerData.localeMoment(firstDayOfMonth).add(3 * num, 'months').format(DATE_FORMAT);
    const endDate = schedulerData.localeMoment(startDate).add(2, 'months').endOf('month').format(DATE_FORMAT);
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
    const activity_promise = Api.makeGetRequest({ url: '/api/project_resources/activity' });
    Promise.all([resources_promise, events_promise, activity_promise]).then((values) => {
      const resources = values[0].data;
      const events = values[1].data;
      const activities = values[2].data;
      const assignedProjectIds = _.map(events, 'projectId');
      schedulerData.setResources(resources);
      schedulerData.setEvents(events);
      this.setState({
        viewModel: schedulerData,
        resources,
        events,
        assignedProjectIds,
        activities,
      });
    });
  }

  prevClick = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const schedulerData = this.state.viewModel;
    schedulerData.prev();
    schedulerData.setEvents(this.state.events);
    this.setState({
      viewModel: schedulerData,
    }, () => {
      this.setState({
        schedulerHeader: this.schedulerHeader(),
      });
    });
  }

  nextClick = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const schedulerData = this.state.viewModel;
    schedulerData.next();
    schedulerData.setEvents(this.state.events);
    this.setState({
      viewModel: schedulerData,
    }, () => {
      this.setState({
        schedulerHeader: this.schedulerHeader(),
      });
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
    const datetime = schedulerData.localeMoment(item.time);
    let isCurrentDate = false;
    const isFriday = datetime.weekday() === 5;
    const isMonday = datetime.weekday() === 1;
    const isLastDay = datetime.date() === datetime.daysInMonth();
    const childeStyle = {
      display: 'inline-block',
      lineHeight: '1.15',
      position: 'absolute',
      bottom: '2px',
      backgroundColor: '#fff',
    };

    isCurrentDate = datetime.isSame(new Date(), 'day');
    childeStyle.fontSize = '0px';

    style.border = 'none';
    style.position = 'relative';
    if (isCurrentDate) {
      style.backgroundColor = '#66b4ee';
      childeStyle.fontSize = '11px';
      childeStyle.left = '0';
      childeStyle.bottom = '28px';
    }
    if (isFriday) {
      style.borderRight = '1px dashed #E0E0E0';
      childeStyle.fontSize = '11px';
      childeStyle.right = '0';
      if (datetime.date() === datetime.daysInMonth() - 1 || datetime.date() === datetime.daysInMonth() - 2) {
        style.borderRight = '1px solid #828282';
      }
    }

    if (isMonday) {
      childeStyle.fontSize = '11px';
      childeStyle.left = '0';
    }

    if (isLastDay) {
      style.borderRight = '1px solid #828282';
    }

    const className = `header3-text ${datetime.format('MMMM').toLowerCase()}`;
    return (
      <th key={item.time} className={className} style={style}>
        <b key={datetime} style={childeStyle}>{datetime.format('ddd, DD/MM')}</b>
      </th>
    );
  }

  eventItemTemplateResolver = (schedulerData, event, bgColor, isStart, isEnd, mustAddCssClass, mustBeHeight) => {
    const borderColor = tinycolor(bgColor).darken(5);
    const backgroundColor = bgColor;
    const titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, event);
    const divStyle = {
      border: `2px solid ${borderColor}`,
      borderRadius: '4px',
      backgroundColor,
      height: mustBeHeight,
      width: 'calc(100% + 4px)',
      transform: 'translateX(-2px)',
    };
    if (event.type === 2) { divStyle.height = '100%'; }
    const className = event.type === 2 ? 'vacation' : 'normal';

    return (
      <div key={event.id} className={`${mustAddCssClass} ${className}`} style={divStyle}>
        <span style={{ lineHeight: `${mustBeHeight}px` }}>{titleText}</span>
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

  eventItemPopoverTemplateResolver = (schedulerData, eventItem, title, note, start, end) => (
    <>
      <h3 className="popover-event-title">
        <div className="circular empty label ui" style={{ background: `${eventItem.bgColor} none repeat scroll 0% 0%` }} />
        {title}
      </h3>
      <h4>{note}</h4>
      <h5>{`${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`}</h5>
      <div className="event-buttons">
        <div className="event-delete" onClick={() => this.destroyEvent(eventItem)}>
          {I18n.t('common.destroy')}
        </div>
        <div className="event-edit" onClick={() => this.modal.showEditEvent(eventItem)}>
          {I18n.t('common.edit')}
        </div>
      </div>
    </>
  );

  schedulerHeader() {
    const { viewModel } = this.state;
    const firstMonth = moment(viewModel.startDate).format('MMMM');
    const secondMonth = moment(viewModel.startDate).add(1, 'M').format('MMMM');
    const thirdMonth = moment(viewModel.startDate).add(2, 'M').format('MMMM');
    const firstMonthSelector = $('.scheduler-bg-table').first().children('thead').find(`.${firstMonth.toLowerCase()}`);
    const secondMonthSelector = $('.scheduler-bg-table').first().children('thead').find(`.${secondMonth.toLowerCase()}`);
    const thirdMonthSelector = $('.scheduler-bg-table').first().children('thead').find(`.${thirdMonth.toLowerCase()}`);
    const firstMonthWidth = (firstMonthSelector.length) * firstMonthSelector.first().outerWidth();
    const secondMonthWidth = (secondMonthSelector.length) * secondMonthSelector.first().outerWidth();
    const thirdMonthWidth = (thirdMonthSelector.length) * thirdMonthSelector.first().outerWidth();
    const resourceWidth = $('.resource-table').first().width();
    const totalWidth = resourceWidth + firstMonthWidth + secondMonthWidth + thirdMonthWidth;
    const firstMonthPercentageWidth = `${(firstMonthWidth / totalWidth) * 100}%`;
    const secondMonthPercentageWidth = `${(secondMonthWidth / totalWidth) * 100}%`;
    const thirdMonthPercentageWidth = `${(thirdMonthWidth / totalWidth) * 100}%`;
    const resourcePercentageWidth = `${(resourceWidth / totalWidth) * 100}%`;

    return (
      <div className="scheduler-header">
        <div className="add-resource" style={{ width: resourcePercentageWidth }}>
          <button className="btn btn-success bt-submit" type="button" onClick={this.onAddResourceClick}>
            <span>{I18n.t('apps.projects_distribution.add_resource')}</span>
          </button>
        </div>
        <div style={{ width: firstMonthPercentageWidth }}>
          <div className="chevron-left">
            <i className="fa fa-chevron-left" onClick={this.prevClick} />
          </div>
          {firstMonth}
        </div>
        <div style={{ width: secondMonthPercentageWidth }}>
          {secondMonth}
        </div>
        <div style={{ width: thirdMonthPercentageWidth }}>
          {thirdMonth}
          <div className="chevron-right">
            <i className="fa fa-chevron-right" onClick={this.nextClick} />
          </div>
        </div>
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
      assignedProjectIds, viewModel, users, resources, projects, schedulerHeader, selectedProjects, selectedUsers,
    } = this.state;
    Loader.hideLoader();
    return (
      <>
        {viewModel ? (
          <div className="projects-distribution">
            {schedulerHeader}
            <Scheduler
              schedulerData={viewModel}
              prevClick={this.prevClick}
              nextClick={this.nextClick}
              onSelectDate={this.onSelectDate}
              onViewChange={this.onViewChange}
              eventItemClick={this.eventClicked}
              Footer={this.Footer}
              updateEventStart={this.updateEventStart}
              updateEventEnd={this.updateEventEnd}
              moveEvent={this.moveEvent}
              newEvent={this.newEvent}
              nonAgendaCellHeaderTemplateResolver={this.nonAgendaCellHeaderTemplateResolver}
              eventItemTemplateResolver={this.eventItemTemplateResolver}
              slotClickedFunc={this.slotClickedFunc}
              eventItemPopoverTemplateResolver={this.eventItemPopoverTemplateResolver}
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
