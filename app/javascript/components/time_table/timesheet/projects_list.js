import React from 'react';
import PropTypes from 'prop-types';

class ProjectsList extends React.Component {
  constructor (props) {
    super(props);

    this.onChangeProject = this.onChangeProject.bind(this);
  }

  static propTypes = {
    projects: PropTypes.array,
    currentProject: PropTypes.object
  }

  onChangeProject (e) {
    this.props.onChangeProject(e);
  }

  render () {
    return (
      <div className="menu transition  visible" tabIndex="-1" style={{ display: 'block !important' }}>
        { this.props.projects.map((project, index) => (
          <div key={index} data-value={project.id} className="item" onClick={this.onChangeProject}>
            <div className="circular empty label ui" style={{ background: `#${project.color}` }}></div>
            {project.id === this.props.currentProject.id ? <b>{project.name}</b> : project.name}
          </div>
        )) }
      </div>
    )
  }
}

export default ProjectsList;
