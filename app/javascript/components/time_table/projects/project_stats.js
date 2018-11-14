import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class ProjectStats extends React.Component {
  render () {
    const stats = this.props.stats;
    const data  = stats[0];

    return (
      <div className="five wide column card">
        <div className="title">
          <h3>
            {data.name}
            <div className="badge" style={{ 'background-color': '#' + data.color, width: '18px', height: '18px', display: 'block' }}></div>
          </h3>
          <p className="center"> {data.leader ? data.leader.name : ''} </p>
          <ul>
            { stats.map((stat, index) => (
              <li className="person" key={index}> {stat.user.name} </li>
            )) }
          </ul>
        </div>
      </div>
    )
  }
}

export default ProjectStats;
