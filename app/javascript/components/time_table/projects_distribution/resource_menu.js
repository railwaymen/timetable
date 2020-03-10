import React from 'react';
import * as Api from '../../shared/api';

class ResourceMenu extends React.Component {
  constructor(props) {
    super(props);

    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  onExitClick() {
    $('#modal').hide();
  }

  onDeleteClick() {
    Api.makeDeleteRequest({
      url: `/api/resources/${this.props.resourceId}`,
    }).then(() => {
      this.props.updateResourcesAndEvents();
    });
  }

  render() {
    return (
      <div className="ui centered-modal modal transition visible active">
        <i className="close icon" />
        <div className="header">{I18n.t('apps.projects_distribution.resource_menu')}</div>
        <div className="content">
          <button className="button red icon labeled right ui" id="generate" type="button" onClick={this.onDeleteClick}>
            {I18n.t('apps.projects_distribution.delete_resource')}
            <i className="angle double icon right" />
          </button>
        </div>
        <div className="actions">
          <button className="button green icon labeled right ui" id="generate" type="button" onClick={this.onExitClick}>
            {I18n.t('apps.projects_distribution.exit')}
            <i className="angle double icon right" />
          </button>
        </div>
      </div>
    );
  }
}

export default ResourceMenu;
