import React from 'react';

class ProjectStats extends React.Component {
  projectLabel() {
    const data = this.props.stats[0];
    if (currentUser.canManageProject({ id: data.project_id })) {
      return (
        <a href={`/projects/${data.project_id}/work_times`}>
          {data.name}
        </a>
      );
    }
    return data.name;
  }

  render() {
    const { stats } = this.props;
    const data = stats[0];

    return (
      <div className="five wide column card">
        <div className="title">
          <h3>
            {this.projectLabel()}
            <div
              className="badge"
              style={{
                backgroundColor: `#${data.color}`, width: '18px', height: '18px', display: 'block',
              }}
            />
          </h3>
          <p className="center">
            {data.leader ? data.leader.name : ''}
          </p>
          <ul>
            { stats.map((stat, index) => (
              <li className="person" key={index}> {/* eslint-disable-line */}
                {' '}
                {stat.user.name}
                {' '}
              </li>
            )) }
          </ul>
        </div>
      </div>
    );
  }
}

export default ProjectStats;
