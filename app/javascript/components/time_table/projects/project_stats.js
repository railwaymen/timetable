import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

function ProjectStats(props) {
  function projectLabel() {
    const { stats } = props;

    if (currentUser.canManageProject({ id: stats.project_id })) {
      return (
        <Link to={`/projects/${stats.project_id}/work_times`}>
          {stats.name}
        </Link>
      );
    }
    return stats.name;
  }

  function renderName(first_name, last_name) {
    return [first_name, last_name].join(' ');
  }

  const { stats } = props;

  return (
    <div className="col-xs-12 col-sm-6 col-lg-4 card-container project-card">
      <div className="card h-100">
        <h3 className="title">
          {projectLabel()}
          <div
            className="badge"
            style={{
              backgroundColor: `#${stats.color}`, width: '18px', height: '18px', display: 'block',
            }}
          />
        </h3>
        <p className="text-center">
          {stats.leader_first_name ? renderName(stats.leader_first_name, stats.leader_last_name) : ''}
        </p>
        <ul>
          { stats.users.map((user) => (
            <li className="person" key={user.id}>
              {renderName(user.first_name, user.last_name)}
            </li>
          )) }
        </ul>
      </div>
    </div>
  );
}

ProjectStats.propTypes = {
  stats: PropTypes.object.isRequired,
};

export default ProjectStats;
