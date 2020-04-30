import React from 'react';
import _ from 'lodash';

import tinycolor from 'tinycolor2';
import Dropdown from '../../shared/dropdown';

class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onAllClick = this.onAllClick.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.onUserDelete = this.onUserDelete.bind(this);
    this.state = {
      users: [],
      selectedUser: undefined,
    };
  }

  componentDidMount() {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    const observer = new MutationObserver(() => {
      this.setState({
        userFilter: this.renderUserFilter(),
      });
    });
    observer.observe(document.getElementById('RBS-Scheduler-root'), {
      childList: true,
      subtree: true,
    });
    this.getUsers();
  }

  getUsers() {
    fetch('/api/users?filter=active&staff')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          users: data,
          selectedUser: data[0],
          userFilter: this.renderUserFilter(data[0]),
        });
      });
  }

  onClick(projectId) {
    let { selectedProjects } = this.props;
    if (_.includes(selectedProjects, projectId)) {
      selectedProjects = selectedProjects.filter((p) => p !== projectId);
    } else {
      selectedProjects = selectedProjects.concat(projectId);
    }
    this.props.showSelectedProjects(selectedProjects);
  }

  onAllClick() {
    this.props.showSelectedProjects([]);
  }

  updateUser(selectedUser) {
    let { selectedUsers } = this.props;
    if (_.findIndex(selectedUsers, (u) => u.id === selectedUser.id) !== -1) { return; }
    selectedUsers = selectedUsers.concat({ name: selectedUser.name, id: selectedUser.id });
    this.props.showSelectedUsers(selectedUsers);
  }

  onUserDelete(userId) {
    let { selectedUsers } = this.props;
    selectedUsers = selectedUsers.filter((u) => u.id !== userId);
    this.props.showSelectedUsers(selectedUsers);
  }

  filterUsers = (filter) => {
    const { users } = this.state;
    const lowerFilter = filter.toLowerCase();
    return _.filter(users, (p) => (
      p.active && (`${p.first_name} ${p.last_name}`.toLowerCase().match(lowerFilter) || `${p.first_name} ${p.last_name}`.toLowerCase().match(lowerFilter))
    ));
  }

  renderUsersList(object) {
    return (
      <div>
        {object.name}
      </div>
    );
  }

  renderUserFilter(user) {
    const { users } = this.state;
    const selectedUser = this.state.selectedUser ? this.state.selectedUser : user;
    const resourceWidth = $('.resource-view').first().width();
    const width = `${resourceWidth}px`;
    return (
      <div className="user-filter-container" style={{ width }}>
        <div className="user-filter">
          { selectedUser ? (
            <Dropdown
              objects={users}
              updateObject={this.updateUser}
              selectedObject={selectedUser}
              filterObjects={this.filterUsers}
              renderSelectedObject={() => undefined}
              renderObjectsList={this.renderUsersList}
            />
          ) : null }
          <div className="reset-button-container" onClick={() => { this.props.showSelectedUsers([]); }}>
            <div className="reset-button">
              Reset
            </div>
          </div>
        </div>
        {this.renderSelectedUsersList()}
      </div>
    );
  }

  renderSelectedUsersList() {
    const { selectedUsers } = this.props;
    if (selectedUsers.length === 0) { return undefined; }
    const list = [];
    selectedUsers.forEach((user) => {
      list.push(
        <div className="selected-user" key={user.id}>
          {user.name}
          <i className="icon close" onClick={() => this.onUserDelete(user.id)} />
        </div>,
      );
    });
    return (
      <div className="selected-users-list">
        {list}
      </div>
    );
  }

  renderLegend() {
    const { assignedProjectIds, projects, selectedProjects } = this.props;
    const legend = [];
    projects.filter((project) => _.includes(assignedProjectIds, project.id)).forEach((project) => {
      const tempBorderColor = tinycolor(`#${project.color}`).darken(5);
      let backgroundColor = `#${project.color}`;
      let fontColor = 'white';
      if (selectedProjects.length !== 0 && !_.includes(selectedProjects, project.id)) {
        backgroundColor = 'transparent';
        fontColor = `#${project.color}`;
      }
      legend.push(
        <div
          className="project-legend"
          key={project.id}
          style={{ border: `2px solid ${tempBorderColor}`, backgroundColor, color: fontColor }}
          onClick={() => this.onClick(project.id)}
        >
          {project.name}
        </div>,
      );
    });
    return (
      <div className="projects-legend-container">
        {legend}
      </div>
    );
  }

  render() {
    const { userFilter } = this.state;

    return (
      <div className="footer">
        {userFilter}
        <div className="footer-legend">
          {this.renderLegend()}
          <div className="all-button-container">
            <div className="all-button" onClick={this.onAllClick}>
              {I18n.t('common.all')}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;
