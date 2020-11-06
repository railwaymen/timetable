import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

function ProjectStats(props) {
  function projectLabel() {
    const { stats } = props;

    if (currentUser.canManageProject({ id: stats.id })) {
      return (
        <Link to={`/projects/${stats.id}/work_times`}>
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
      <div className="card p-0 h-100">
        <div className="card-header">
          <h3 className="title row mx-0">
            {projectLabel()}
            <div
              className=" ml-auto badge"
              style={{
                backgroundColor: `#${stats.color}`, width: '18px', height: '18px', display: 'block',
              }}
            />
          </h3>
        </div>
        {stats.leader_name && (
          <p className="font-weight-bold text-center">
            {stats.leader_name}
          </p>
        )}
        <div className="card-body">
          <ul>
            { stats.users.map((user) => (
              <li className="person" key={user.id}>
                {renderName(user.first_name, user.last_name)}
              </li>
            )) }
          </ul>
        </div>
      </div>
    </div>
  );
}

ProjectStats.propTypes = {
  stats: PropTypes.object.isRequired,
};

export default ProjectStats;
