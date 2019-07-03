import React from 'react';

import { Link } from 'react-router-dom';

class ProjectStats extends React.Component {
  projectLabel() {
    const data = this.props.stats[0];
    if (currentUser.canManageProject({ id: data.project_id })) {
      return (
        <Link to={`/projects/${data.project_id}/work_times`}>
          {data.name}
        </Link>
      );
    }
    return data.name;
  }

  render() {
    const { stats } = this.props;
    const data = stats[0];

    return (
      <div className="col-xs-12 col-sm-6 col-lg-4 card-container project-card">
        <div className="card h-100">
          <h3 className="title">
            {this.projectLabel()}
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
            { stats.map((stat, index) => (
              <li className="person" key={index}> {/* eslint-disable-line */}
                {stat.user.name}
              </li>
            )) }
          </ul>
        </div>
      </div>
    );
  }
}

export default ProjectStats;
