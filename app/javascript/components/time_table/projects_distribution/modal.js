import React from 'react';
import AddResource from './add_resource';
import Event from './event';

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.showAddResource = this.showAddResource.bind(this);
    this.state = {
      modal: undefined,
    };
  }

  showAddResource() {
    this.setState({
      modal: this.renderAddResource(),
    }, () => {
      this.addResource.updateAddResourceModal(this.props.users[0]);
      $('#modal').show();
    });
  }

  showAddEvent(slotId, slotName, start, end) {
    this.setState({
      modal: this.renderEvent(slotId, slotName, start, end, true),
    }, () => {
      this.event.updateAddModal(start, end);
      $('#modal').show();
    });
  }

  showEditEvent(event) {
    this.setState({
      modal: this.renderEvent(event.resourceId, '', event.start, event.end, event.resizable, event),
    }, () => {
      this.event.updateEditModal(event);
      $('.ant-popover').not('.ant-popover-hidden').addClass('ant-popover-hidden');
      $('#modal').show();
    });
  }

  renderAddResource() {
    return (
      <AddResource
        ref={(addResource) => { this.addResource = addResource; }}
        users={this.props.users}
        resources={this.props.resources}
        updateResourcesAndEvents={this.props.updateResourcesAndEvents}
      />
    );
  }

  renderEvent(slotId, slotName, start, end, resizable, eventInstance = null) {
    return (
      <Event
        ref={(event) => { this.event = event; }}
        projects={this.props.projects}
        updateResourcesAndEvents={this.props.updateResourcesAndEvents}
        slotId={slotId}
        slotName={slotName}
        start={start}
        end={end}
        resizable={resizable}
        eventInstance={eventInstance}
        addEvent={this.props.addEvent}
        showUpdatedEvent={this.props.showUpdatedEvent}
        destroyEvent={this.props.destroyEvent}
      />
    );
  }

  render() {
    const { modal } = this.state;

    return (
      <div id="modal" style={{ display: 'none' }}>
        {modal}
        <div className="ui dimmer modals modal-backdrop page transition visible active" style={{ display: 'flex !important' }} />
      </div>
    );
  }
}

export default Modal;
