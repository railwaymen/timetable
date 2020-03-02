import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

function ProjectStats(props) {
  function projectLabel() {
    const data = props.stats[0];
    if (currentUser.canManageProject({ id: data.project_id })) {
      return (
        <Link to={`/projects/${data.project_id}/work_times`}>
          {data.name}
        </Link>
      );
    }
    return data.name;
  }

  const { stats } = props;
  const data = stats[0];

  return (
    <div className="col-xs-12 col-sm-6 col-lg-4 card-container project-card">
      <div className="card h-100">
        <h3 className="title">
          {projectLabel()}
          <div
            className="badge"
            style={{
              backgroundColor: `#${data.color}`, width: '18px', height: '18px', display: 'block',
            }}
          />
        </h3>
        <p className="text-center">
          {data.leader ? data.leader.name : ''}
        </p>
        <ul>
          { stats.map((stat) => (
            <li className="person" key={stat.id}>
              {stat.user.name}
            </li>
          )) }
        </ul>
      </div>
    </div>
  );
}

ProjectStats.propTypes = {
  stats: PropTypes.array.isRequired,
};

export default ProjectStats;
