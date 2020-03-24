import React from 'react';
import _ from 'lodash';
import tinycolor from 'tinycolor2';

class ProjectsLegend extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onAllClick = this.onAllClick.bind(this);
    this.state = {
      buffer: this.renderBuffer(),
    };
  }

  componentDidMount() {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    const observer = new MutationObserver(() => {
      this.setState({
        buffer: this.renderBuffer(),
      });
    });
    observer.observe(document.getElementById('RBS-Scheduler-root'), {
      childList: true,
      subtree: true,
    });
  }

  onClick(projectId) {
    let { selectedProjects } = this.props;
    if (_.includes(selectedProjects, projectId)) {
      selectedProjects = selectedProjects.filter((p) => p !== projectId);
    } else {
      selectedProjects = selectedProjects.concat(projectId);
    }
    this.props.showSelectedProjects(selectedProjects);
  }

  onAllClick() {
    this.props.showSelectedProjects([]);
  }

  renderBuffer() {
    const schedulerHeight = $('#RBS-Scheduler-root').first().outerHeight(true);
    const height = `${schedulerHeight}px`;
    return (
      <div style={{ height }} />
    );
  }

  renderLegend() {
    const { projects, selectedProjects } = this.props;
    const legend = [];
    projects.forEach((project) => {
      const tempBorderColor = tinycolor(`#${project.color}`).darken(5);
      let backgroundColor = `#${project.color}`;
      let fontColor = 'white';
      if (selectedProjects.length !== 0 && !_.includes(selectedProjects, project.id)) {
        backgroundColor = 'transparent';
        fontColor = `#${project.color}`;
      }
      legend.push(
        <div
          className="project-legend"
          key={project.id}
          style={{ border: `2px solid ${tempBorderColor}`, backgroundColor, color: fontColor }}
          onClick={() => this.onClick(project.id)}
        >
          {project.name}
        </div>,
      );
    });
    return (
      <div className="legend-container">
        <div className="projects-legend-container">
          {legend}
        </div>
        <div className="all-button" onClick={this.onAllClick}>
          {I18n.t('common.all')}
        </div>
      </div>
    );
  }

  render() {
    const { buffer } = this.state;
    return (
      <div className="projects-legend">
        {buffer}
        {this.renderLegend()}
      </div>
    );
  }
}

export default ProjectsLegend;
