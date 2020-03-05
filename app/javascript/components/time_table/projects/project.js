import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

function Project(props) {
  function renderButtons() {
    if (currentUser.canManageProject(props.project)) {
      return (
        <NavLink className="ui button icon basic blue" to={`/projects/${props.project.id}/edit`}>
          <i className="icon pencil" />
        </NavLink>
      );
    }
    return null;
  }

  function renderProjectName() {
    const { project } = props;

    if (currentUser.canManageProject(project)) {
      return (
        <NavLink className="item" to={`/projects/${project.id}/work_times`}>{project.name}</NavLink>
      );
    }
    return project.name;
  }

  const { project } = props;

  return (
    <tr>
      <td />
      <td>{renderProjectName()}</td>
      <td>{project.leader ? `${project.leader.first_name} ${project.leader.last_name}` : ''}</td>
      <td>
        <div className="ui buttons">
          {renderButtons()}
        </div>
      </td>
    </tr>
  );
}

Project.propTypes = {
  project: PropTypes.object.isRequired,
};

export default Project;
