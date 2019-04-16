import React from 'react';
import PropTypes from 'prop-types';

class ProjectsList extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeProject = this.onChangeProject.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  static propTypes = {
    projects: PropTypes.array,
    currentProject: PropTypes.object,
  }

  onChangeProject(e) {
    this.props.onChangeProject(e);
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === 'Spacebar') {
      this.onChangeProject(event);
    }
  }

  render() {
    return (
      <div className="menu transition visible" tabIndex="-1" style={{ display: 'block !important' }}>
        { this.props.projects.map(project => (
          <div key={project.id} data-value={project.id} tabIndex="0" className="item" onClick={this.onChangeProject} onKeyPress={this.handleKeyPress}>
            <div className="circular empty label ui" style={{ background: `#${project.color}` }} />
            {project.id === this.props.currentProject.id ? <b>{project.name}</b> : project.name}
          </div>
        )) }
      </div>
    );
  }
}

export default ProjectsList;
