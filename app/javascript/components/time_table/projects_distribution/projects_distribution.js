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
      viewModel: undefined,
      users: [],
      projects: [],
      events: [],
      schedulerHeader: null,
      expandedResources: [],
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
        schedulerWidth: '95%',
        schedulerMaxHeight: '0',
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

  getData(schedulerData) {
    const resources_promise = Api.makeGetRequest({
      url: '/api/project_resources',
    });
    const events_promise = Api.makeGetRequest({
      url: '/api/project_resource_assignments/find_by_slot',
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
      const projects = values[3].data;
      schedulerData.setResources(resources);
      schedulerData.setEvents(events);
      const groupssss = resources.filter((e) => e.groupOnly === true);
      _.forEach(groupssss, (g) => schedulerData.toggleExpandStatus(g.id));
      this.setState({
        viewModel: schedulerData,
        resources,
        users,
        projects,
      }, () => {
        this.setState({
          schedulerHeader: this.schedulerHeader(),
        });
      });
    });
  }

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
          <button className="bt bt-main bt-submit" type="button" onClick={this.onAddResourceClick}>
            <span>{I18n.t('apps.projects_distribution.add_resource')}</span>
          </button>
        </div>
        <div style={{ width: firstMonthPercentageWidth }}>
          <div className="chevron-left">
            <i className="glyphicon glyphicon-chevron-left" onClick={this.prevClick} />
          </div>
          {firstMonth}
        </div>
        <div style={{ width: secondMonthPercentageWidth }}>
          {secondMonth}
        </div>
        <div style={{ width: thirdMonthPercentageWidth }}>
          {thirdMonth}
          <div className="chevron-right">
            <i className="glyphicon glyphicon-chevron-right" onClick={this.nextClick} />
          </div>
        </div>
      </div>
    );
  }

  getResourcesAndEvents(schedulerData) {
    const { expandedResources, selectedProjects, selectedUsers } = this.state;
    const selectedUsersIds = selectedUsers.map((u) => u.id);
    const resources_promise = Api.makeGetRequest({
      url: `/api/project_resources?selected_users=${selectedUsersIds}`,
    });
    let url = `/api/project_resource_assignments/find_by_slot?expanded_resources=${expandedResources}`;
    url += `&selected_projects=${selectedProjects}`;
    url += `&selected_users=${selectedUsersIds}`;
    const events_promise = Api.makeGetRequest({
      url,
    });
    Promise.all([resources_promise, events_promise]).then((values) => {
      const resources = values[0].data;
      const events = values[1].data;
      schedulerData.setResources(resources);
      schedulerData.setEvents(events);
      if (selectedUsers.length === 0) { this.foldResources(schedulerData); }
      this.setState({
        viewModel: schedulerData,
        resources,
        events,
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

  onAddResourceClick() {
    this.modal.showAddResource();
  }

  updateResourcesAndEvents() {
    this.getResourcesAndEvents(this.state.viewModel);
  }

  addEvent(event) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const schedulerData = this.state.viewModel;
    schedulerData.addEvent(event);
    this.foldResources(schedulerData);
    this.setState({
      viewModel: schedulerData,
    });
  }

  showUpdatedEvent(event) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const schedulerData = this.state.viewModel;
    schedulerData.removeEventById(event.id);
    schedulerData.addEvent(event);
    this.foldResources(schedulerData);
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

  foldResources(schedulerData, options = {}) {
    const selectedUsers = options.selectedUsers ? options.selectedUsers : this.state.selectedUsers;
    if (selectedUsers.length > 0) { return; }
    const expandedResources = options.expandedResources ? options.expandedResources : this.state.expandedResources;
    const groups = this.state.resources.filter((r) => r.groupOnly === true && !_.includes(expandedResources, r.id));
    _.forEach(groups, (g) => schedulerData.toggleExpandStatus(g.id));
  }

  showSelectedProjects(selectedProjects) {
    if (selectedProjects.length === this.state.selectedProjects.length) { return; }
    const schedulerData = this.state.viewModel;
    const { expandedResources, selectedUsers } = this.state;
    const selectedUsersIds = selectedUsers.map((u) => u.id);
    let url = `/api/project_resource_assignments/find_by_slot?expanded_resources=${expandedResources}`;
    url += `&selected_projects=${selectedProjects}`;
    url += `&selected_users=${selectedUsersIds}`;
    Api.makeGetRequest({
      url,
    }).then((response) => {
      schedulerData.setEvents(response.data);
      if (selectedUsers.length === 0) { this.foldResources(schedulerData); }
      this.setState({
        schedulerData,
        events: response.data,
        selectedProjects,
      });
    });
  }

  showSelectedUsers(selectedUsers) {
    const { expandedResources, selectedProjects, viewModel } = this.state;
    const selectedUsersIds = selectedUsers.map((u) => u.id);
    const resources_promise = Api.makeGetRequest({
      url: `/api/project_resources?selected_users=${selectedUsersIds}`,
    });
    let url = `/api/project_resource_assignments/find_by_slot?expanded_resources=${expandedResources}`;
    url += `&selected_projects=${selectedProjects}`;
    url += `&selected_users=${selectedUsersIds}`;
    const events_promise = Api.makeGetRequest({
      url,
    });
    Promise.all([resources_promise, events_promise]).then((values) => {
      const resources = values[0].data;
      const events = values[1].data;
      viewModel.setResources(resources);
      viewModel.setEvents(events);
      this.foldResources(viewModel, { selectedUsers });
      this.setState({
        selectedUsers,
        viewModel,
        resources,
        events,
      });
    });
  }

  render() {
    const {
      viewModel, users, resources, projects, schedulerHeader, selectedProjects, selectedUsers,
    } = this.state;
    Loader.hideLoader();
    return (
      <div>

        { viewModel ? (
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
              updateEventEnd={this.updateEventEnd}
              moveEvent={this.moveEvent}
              newEvent={this.newEvent}
              toggleExpandFunc={this.toggleExpandFunc}
              nonAgendaCellHeaderTemplateResolver={this.nonAgendaCellHeaderTemplateResolver}
              eventItemTemplateResolver={this.eventItemTemplateResolver}
              slotClickedFunc={this.slotClickedFunc}
              eventItemPopoverTemplateResolver={this.eventItemPopoverTemplateResolver}
            />
            <Footer
              projects={projects}
              showSelectedProjects={this.showSelectedProjects}
              selectedProjects={selectedProjects}
              showSelectedUsers={this.showSelectedUsers}
              selectedUsers={selectedUsers}
            />
          </div>
        ) : (
          'Loading'
        ) }

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
      </div>
    );
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

  eventClicked = (schedulerData, event) => {
    this.modal.showEditEvent(event);
  };

  destroyEvent(event) {
    const schedulerData = this.state.viewModel;
    Loader.showLoader();
    Api.makeDeleteRequest({
      url: `/api/project_resource_assignments/${event.id}`,
    }).then(() => {
      schedulerData.removeEventById(event.id);
      this.foldResources(schedulerData);
      this.setState({
        viewModel: schedulerData,
      });
    }).catch(() => {
      Loader.hideLoader();
    });
  }

  updateEventStart = (schedulerData, event, newStart) => {
    const params = {
      event: {
        starts_at: newStart,
      },
    };
    const promise = this.updateEvent(event, params);
    Loader.showLoader();
    promise.then(() => {
      schedulerData.updateEventStart(event, newStart);
      this.foldResources(schedulerData);
      this.setState({
        viewModel: schedulerData,
      });
    }).catch(() => {
      Loader.hideLoader();
    });
  }

  updateEventEnd = (schedulerData, event, newEnd) => {
    const params = {
      event: {
        ends_at: newEnd,
      },
    };
    const promise = this.updateEvent(event, params);
    Loader.showLoader();
    promise.then(() => {
      schedulerData.updateEventEnd(event, newEnd);
      this.foldResources(schedulerData);
      this.setState({
        viewModel: schedulerData,
      });
    }).catch(() => {
      Loader.hideLoader();
    });
  }

  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    const params = {
      event: {
        resource_rid: slotId,
        starts_at: start,
        ends_at: end,
      },
    };
    const promise = this.updateEvent(event, params);
    Loader.showLoader();
    promise.then(() => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      this.foldResources(schedulerData);
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

  toggleExpandFunc = (schedulerData, slotId) => {
    Loader.showLoader();
    schedulerData.toggleExpandStatus(slotId);
    const { expandedResources, selectedProjects } = this.state;
    if ($(`td[data-resource-id='${slotId}']`).find('i.anticon.anticon-plus-square').length) {
      const newExpandedResources = expandedResources.concat(slotId);
      Api.makeGetRequest({
        url: `/api/project_resource_assignments/find_by_slot?expanded_resources=${newExpandedResources}&selected_projects=${selectedProjects}`,
      }).then((response) => {
        schedulerData.setEvents(response.data);
        this.foldResources(schedulerData, { expandedResources: newExpandedResources });
        this.setState({
          viewModel: schedulerData,
          events: response.data,
          expandedResources: newExpandedResources,
        });
      });
    } else {
      this.setState({
        viewModel: schedulerData,
        expandedResources: expandedResources.filter((r) => r !== slotId),
      });
    }
  }

  nonAgendaCellHeaderTemplateResolver = (schedulerData, item, formattedDateItems, style) => {
    const datetime = schedulerData.localeMoment(item.time);
    let isCurrentDate = false;
    const isFriday = datetime.weekday() === 5;
    const isMonday = datetime.weekday() === 1;
    const isLastDay = datetime.date() === datetime.daysInMonth();

    isCurrentDate = datetime.isSame(new Date(), 'day');
    style.fontSize = '0px';

    style.border = 'none';
    if (isCurrentDate) {
      style.backgroundColor = '#66b4ee';
      style.fontSize = '0.39vw';
    }
    if (isFriday) {
      style.borderRight = '1px dashed #E0E0E0';
      style.fontSize = '0.39vw';
      if (datetime.date() === datetime.daysInMonth() - 1 || datetime.date() === datetime.daysInMonth() - 2) {
        style.borderRight = '1px solid #828282';
      }
    }

    if (isMonday) {
      style.fontSize = '0.39vw';
    }

    if (isLastDay) {
      style.borderRight = '1px solid #828282';
    }

    const className = `header3-text ${datetime.format('MMMM').toLowerCase()}`;
    return (
      <th key={item.time} className={className} style={style}>
        <div
          key={datetime}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: `<b>${datetime.format('ddd, DD/MM')}</b>` }}
        />
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

  eventItemPopoverTemplateResolver = (schedulerData, eventItem, title, start, end) => (
    <>
      <h3 className="popover-event-title">
        <div className="circular empty label ui" style={{ background: `${eventItem.bgColor} none repeat scroll 0% 0%` }} />
        {title}
      </h3>
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
}

export default withDragDropContext(ProjectsDistribution);
