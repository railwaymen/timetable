import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { formattedDuration } from '../../shared/helpers';

function Project(props) {
  const [showUsers, setShowUsers] = useState(false);

  function renderButtons() {
    if (currentUser.canManageProject(props.project)) {
      return (
        <NavLink className="ui button icon basic blue" to={`/projects/${props.project.id}/edit`}>
          <i className="fa fa-pencil" />
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

  function renderMilestoneBar() {
    const { milestone } = props;
    if (milestone == null) return null;

    const estimatedValue = milestone.total_estimate ? milestone.total_estimate : 1;
    const percentage = !milestone.work_times_duration ? 0 : (milestone.work_times_duration / estimatedValue) * 100;
    return (
      <div className="row">
        <div className="col-2">{formattedDuration(milestone.work_times_duration)}</div>
        <div className="col-8">
          <div className="progress">
            <div className="progress-bar" role="progressbar" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        <div className="col-2">{formattedDuration(milestone.total_estimate)}</div>
      </div>
    );
  }

  const { project } = props;

  return (
    <tr>
      <td>{renderProjectName()}</td>
      <td>{project.leader_name}</td>
      <td onMouseEnter={() => setShowUsers(true)} onMouseLeave={() => setShowUsers(false)}>
        {project.users.length}
        {showUsers && (
          <div className="project-users">
            {project.users.map((user) => <p className="m-2" key={user.id}>{`${user.first_name} ${user.last_name}`}</p>)}
          </div>
        )}
      </td>
      <td>
        {renderMilestoneBar()}
      </td>
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
