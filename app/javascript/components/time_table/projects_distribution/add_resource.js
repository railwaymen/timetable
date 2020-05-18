import React from 'react';
import _ from 'lodash';
import Modal from '@components/shared/modal';
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
    this.state = {
      selectedUser: undefined,
      selectedResourceGroup: undefined,
      groupOnly: false,
      name: '',
    };
  }

  onChange(e) {
    this.setState({
      selectedResourceGroup: e.target.value,
    });
  }

  onCheckboxChange() {
    this.setState((prevState) => ({ groupOnly: !prevState.groupOnly }));
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
      user_id: selectedUser.id,
      parent_rid: selectedResourceGroup,
      group_only: groupOnly,
      name,
    };
    if (groupOnly) { delete params.user_id; }
    Loader.showLoader();
    Api.makePostRequest({
      url: '/api/project_resources',
      body: params,
    }).then(() => {
      $('#resourceModal').modal('hide');
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
    return _.filter(this.props.users, (p) => (
      p.active && (`${p.first_name} ${p.last_name}`.toLowerCase().match(lowerFilter) || `${p.last_name} ${p.first_name}`.toLowerCase().match(lowerFilter))
    ));
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
    _.filter(this.props.resources, (r) => (r.groupOnly))
      .map((resourceGroup) => (options.push(
        <option value={resourceGroup.realId} key={resourceGroup.id}>
          {resourceGroup.name}
        </option>,
      )));
    return options;
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
      <Modal
        id="resourceModal"
        header={I18n.t('apps.projects_distribution.resource_menu')}
        content={(
          <form className="form">
            <div className="error hidden message ui">
              <p />
            </div>
            <div className="fields row w-100">
              {groupOnly ? (
                <div className="name-field field col-4">
                  <label className="label">{I18n.t('common.name')}</label>
                  <input type="text" name="name" className="form-control" onChange={this.onNameChange} value={name} />
                </div>
              ) : (
                <div className="users-field field col-4">
                  <label className="label">{I18n.t('common.user')}</label>
                  { selectedUser ? (
                    <Dropdown
                      objects={this.props.users}
                      updateObject={this.updateUser}
                      selectedObject={selectedUser}
                      filterObjects={this.filterUsers}
                      renderSelectedObject={this.renderSelectedUser}
                      renderObjectsList={this.renderUsersList}
                    />
                  ) : null }
                </div>
              )}
              <div className="resource-group-field field col-4">
                <label className="label">{I18n.t('apps.projects_distribution.resource_group')}</label>
                <select className="form-control" id="resource_group" type="text" name="resource_group" value={selectedResourceGroup} onChange={this.onChange}>
                  <option value={undefined} />
                  {this.generateResourceGroups()}
                </select>
              </div>
              <div className="group-only-field field form-check col-4">
                <input type="checkbox" className="form-check-input" id="group_only_check" checked={groupOnly} onChange={this.onCheckboxChange} />
                <label htmlFor="group_only_check">{I18n.t('apps.projects_distribution.group_only')}</label>
              </div>
            </div>
          </form>
        )}
        actions={(
          <button className="btn btn-success" id="generate" type="button" onClick={this.onSubmit}>
            <i className="fa fa-angle-double-right mr-2" />
            {I18n.t('common.add')}
          </button>
        )}
      />
    );
  }
}

export default AddResource;
