import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ProjectsList from './projects_list';

class ProjectsDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.expandDropdown = this.expandDropdown.bind(this);
    this.renderProjectsList = this.renderProjectsList.bind(this);
    this.onChangeProject = this.onChangeProject.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  componentDidMount() {
    this.setState({
      filteredProjects: this.filterProjects(),
    });
  }

  static propTypes = {
    projects: PropTypes.array,
    selectedProject: PropTypes.object,
    isExpanded: PropTypes.bool,
    filter: PropTypes.string,
  }

  state = {
    isExpanded: false,
    filter: '',
    filteredProjects: this.filterProjects(''),
  }

  onFilterChange(e) {
    this.setState({
      filter: e.target.value,
      filteredProjects: this.filterProjects(e.target.value),
    });
  }

  onKeyPress(e) {
    const { filteredProjects } = this.state;
    if (e.key === 'Enter' && filteredProjects.length > 0) {
      const projects = this.filterProjects();
      const selectedProject = _.find(projects, p => (
        p.id === filteredProjects[0]
      )) || projects[0];

      this.props.updateProject(selectedProject);
      this.expandDropdown();
    }
  }

  filterProjects(filter = this.state.filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(this.props.projects, p => (
      p.active && p.name.toLowerCase().match(escape(lowerFilter))
    ));
  }

  expandDropdown() {
    const { isExpanded } = this.state;

    if (!isExpanded) {
      document.getElementById('search-input').focus();
      document.addEventListener('click', this.expandDropdown);
    } else {
      document.removeEventListener('click', this.expandDropdown);
    }

    this.setState({ isExpanded: !isExpanded, filter: '', filteredProjects: this.filterProjects('') });
  }

  onBlur() {
    this.setState({ isExpanded: false });
  }

  onChangeProject(e) {
    const projectId = parseInt(e.target.attributes.getNamedItem('data-value').value, 10);

    if (projectId !== this.props.selectedProject) {
      const projects = this.filterProjects('');
      const selectedProject = _.find(projects, p => (
        p.id === projectId
      )) || projects[0];

      this.props.updateProject(selectedProject);

      this.setState({
        isExpanded: false,
      });
    }
  }

  renderProjectsList() {
    return (
      <div style={{ marginTop: '15px' }}>
        <ProjectsList projects={this.state.filteredProjects} currentProject={this.props.selectedProject} onChangeProject={this.onChangeProject} />
      </div>
    );
  }

  render() {
    const { isExpanded, filter } = this.state;
    const { selectedProject } = this.props;

    return (
      <div className="dropdown fluid search ui" style={{ minWidth: '90px' }} onClick={this.expandDropdown}>
        <input type="hidden" name="project" value="12" />
        <input placeholder="Project +" className="search" name="filter" value={filter} autoComplete="off" tabIndex="0" onChange={this.onFilterChange} id="search-input" onKeyPress={this.onKeyPress} />
        <div className={`text active ${(isExpanded ? 'hidden' : '')}`} style={{ background: `#${selectedProject.color}` }}>
          <div className="circular empty label ui" style={{ background: `#${selectedProject.color}` }} />
          {selectedProject.name}
        </div>
        { isExpanded ? this.renderProjectsList() : null }
      </div>
    );
  }
}

export default ProjectsDropdown;
