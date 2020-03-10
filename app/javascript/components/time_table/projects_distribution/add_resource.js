import React from 'react';
import _ from 'lodash';
import Dropdown from '../../shared/dropdown';
import * as Api from '../../shared/api';
import * as Loader from './loader';

class AddResource extends React.Component {
  constructor(props) {
    super(props);

    this.updateUser = this.updateUser.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.filterUsers = this.filterUsers.bind(this);
  }

  state = {
    selectedUser: undefined,
    selectedResourceGroup: undefined,
    groupOnly: false,
    name: '',
  }

  updateUser(selectedUser) {
    this.setState({
      selectedUser,
    });
  }

  updateAddResourceModal(selectedUser) {
    this.setState({
      selectedUser,
      groupOnly: false,
      name: '',
      selectedResourceGroup: '',
    });
  }

  generateResourceGroups() {
    const options = [];
    _.filter(this.props.resources, r => (r.groupOnly))
      .map(resourceGroup => (options.push(
        <option value={resourceGroup.realId} key={resourceGroup.id}>
          {resourceGroup.name}
        </option>,
      )));
    return options;
  }

  onChange(e) {
    this.setState({
      selectedResourceGroup: e.target.value,
    });
  }

  onCheckboxChange() {
    this.setState({
      groupOnly: !this.state.groupOnly,
    });
  }

  onNameChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  onSubmit() {
    const {
      selectedUser, selectedResourceGroup, groupOnly, name,
    } = this.state;
    const params = {
      resource: {
        user_id: selectedUser.id,
        parent_rid: selectedResourceGroup,
        group_only: groupOnly,
        name,
      },
    };
    if (groupOnly) { delete params.resource.user_id; }
    Loader.showLoader();
    Api.makePostRequest({
      url: '/api/resources',
      body: params,
    }).then(() => {
      this.props.updateResourcesAndEvents();
    }).catch((e) => {
      Loader.hideLoader();
      if (e.errors) {
        if (e.errors.rid) {
          alert(`Resource Id ${e.errors.rid}`);
        } else if (e.errors.name) {
          alert(`Resource name ${e.errors.name}`);
        } else {
          alert('Something bad happend');
        }
      } else {
        alert('Something bad happend');
      }
    });
  }

  filterUsers = (filter) => {
    const lowerFilter = filter.toLowerCase();
    return _.filter(this.props.users, p => (
      p.active && (`${p.first_name} ${p.last_name}`.toLowerCase().match(lowerFilter) || `${p.last_name} ${p.first_name}`.toLowerCase().match(lowerFilter))
    ));
  }

  renderSelectedUser(selectedObject) {
    return (
      <div>
        <div className="circular empty label ui" style={{ background: `#${selectedObject.color}` }} />
        {`${selectedObject.first_name} ${selectedObject.last_name}`}
      </div>
    );
  }

  renderUsersList(object, currentObject) {
    return (
      <div>
        <div className="circular empty label ui" style={{ background: `#${object.color}` }} />
        {object.id === currentObject.id ? (
          <b>
            {`${object.first_name} ${object.last_name}`}
          </b>
        ) : `${object.first_name} ${object.last_name}`}
      </div>
    );
  }

  render() {
    const {
      selectedUser, selectedResourceGroup, groupOnly, name,
    } = this.state;

    return (
      <div className="ui centered-modal modal transition visible active">
        <i className="close icon" />
        <div className="header">{I18n.t('apps.projects_distribution.resource_menu')}</div>
        <div className="content">
          <form className="form ui">
            <div className="error hidden message ui">
              <p />
            </div>
            <div className="fields inline">
              {groupOnly ? (
                <div className="name-field field">
                  <label>{I18n.t('common.name')}</label>
                  <input type="text" name="name" onChange={this.onNameChange} value={name} />
                </div>
              ) : (
                <div className="users-field field">
                  <label>{I18n.t('common.user')}</label>
                  { selectedUser ? (
                    <Dropdown objects={this.props.users} updateObject={this.updateUser} selectedObject={selectedUser} filterObjects={this.filterUsers} renderSelectedObject={this.renderSelectedUser} renderObjectsList={this.renderUsersList} />
                  ) : null }
                </div>
              )}
              <div className="resource-group-field field">
                <label>{I18n.t('apps.projects_distribution.resource_group')}</label>
                <select className="dropdown ui" id="resource_group" type="text" name="resource_group" value={selectedResourceGroup} onChange={this.onChange}>
                  <option value={undefined} />
                  {this.generateResourceGroups()}
                </select>
              </div>
              <div className="group-only-field field form-check">
                <input type="checkbox" className="form-check-input" id="group_only_check" checked={groupOnly} onChange={this.onCheckboxChange} />
                <label htmlFor="group_only_check">{I18n.t('apps.projects_distribution.group_only')}</label>
              </div>
            </div>
          </form>
        </div>
        <div className="actions">
          <button className="button green icon labeled right ui" id="generate" type="button" onClick={this.onSubmit}>
            {I18n.t('common.add')}
            <i className="angle double icon right" />
          </button>
        </div>
      </div>
    );
  }
}

export default AddResource;
