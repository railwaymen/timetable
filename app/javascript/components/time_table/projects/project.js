import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class Project extends React.Component {
  static propTypes = {
    project: PropTypes.object
  }

  state = {
    project: {}
  }

  _renderButtons () {
    if (currentUser.admin || currentUser.manager || (this.props.project.leader_id === currentUser.id)) {
      return (
        <NavLink className="ui button icon basic blue" to={`/projects/${this.props.project.id}/edit`}>
          <i className="icon pencil"></i>
        </NavLink>
      )
    }
  }

  _renderProjectName () {
    const { project } = this.props;
    if (currentUser.admin || currentUser.leader) {
      return (<a href={`/projects/${project.id}/work_times`}>
        {project.name}
      </a>);
    } else {
      return project.name;
    }
  }

  render () {
    const { project } = this.props;

    return (
      <tr>
        <td></td>
        <td>{this._renderProjectName()}</td>
        <td>{project.leader ? `${project.leader.first_name} ${project.leader.last_name}` : ''}</td>
        <td>
          <div className="ui buttons">
            {this._renderButtons()}
          </div>
        </td>
      </tr>
    )
  }
}

export default Project;
