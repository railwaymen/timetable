import React from 'react';
import * as Api from './../../shared/api';

class ResourceTooltip extends React.Component {
  constructor(props){
    super(props);

    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.onDocumentBodyClick = this.onDocumentBodyClick.bind(this);
    this.deleteResource = this.deleteResource.bind(this);
  }

  state = {
    show: true,
  }

  componentDidMount() {
    $(document.body).on('click.tooltip', this.onDocumentBodyClick)
  }

  toggleTooltip() {
    const { show } = this.state;
    if (show) {
      this.setState({
        show: false,
      });
      $(document.body).unbind('click.tooltip');
    } else {
      this.setState({
        show: true,
      });
      $(document.body).on('click.tooltip', this.onDocumentBodyClick)
    }
  }

  closeTooltip() {
    this.setState({
      show: false,
    });
    $(document.body).unbind('click.tooltip');
  }

  onDocumentBodyClick(e) {
    if ($(e.target).closest(`.resource-tooltip#${this.props.slotId}`).length === 0 && $(e.target).closest('.slot-text').find(`.resource-tooltip#${this.props.slotId}`).length === 0) {
      this.closeTooltip(); 
    }
  }

  deleteResource() {
    const { slotId, slotName } = this.props;
    if (confirm(I18n.t('apps.projects_distribution.confirm_delete', { resource_name: slotName }))) {
      Api.makeDeleteRequest({
        url: `/api/resources/${slotId}`,
      }).then((response) => {
        this.props.updateResourcesAndEvents();
        this.closeTooltip();
      });
    }
  }

  render() {
    const { show } = this.state;
    return (
      <div>
        { show ? (
          <div className="resource-tooltip" id={this.props.slotId}>
            <div className="tooltip-arrow"/>
            <div className="tooltip-box">
              <div className="tooltip-content" onClick={this.deleteResource}>
                {I18n.t('apps.projects_distribution.delete_resource')}
              </div>
            </div>
          </div>
        ) : undefined }
      </div>
    );
  }
}

export default ResourceTooltip;
