import React from 'react';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api.js';
import ProjectsList from './projects_list.js';
import _ from 'lodash';

class ProjectsDropdown extends React.Component {
  constructor (props) {
    super(props);

    this.expandDropdown = this.expandDropdown.bind(this);
    this._renderProjectsList = this._renderProjectsList.bind(this);
    this.onChangeProject = this.onChangeProject.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.assignProject = this.assignProject.bind(this);
  }

  componentDidMount () {
    this.setState({
      filteredProjects: this.props.projects,
      selectedProject: {}
    })
  }

  static propTypes = {
    projects: PropTypes.array,
    selectedProject: PropTypes.object,
    isExpanded: PropTypes.bool,
    filter: PropTypes.string
  }

  state = {
    selectedProject: {},
    isExpanded: false,
    filter: '',
    filteredProjects: this.props.projects
  }

  assignProject (project) {
    this.setState({
      selectedProject: _.find(this.props.projects, (p) => (
        p.id === project.id
      ))
    })
  }

  onFilterChange (e) {
    this.setState({
      filter: e.target.value
    }, () => {
      this.setState({
        filteredProjects: _.filter(this.props.projects, (p) => (
          p.name.toLowerCase().match(this.state.filter)
        ))
      })
    })
  }

  expandDropdown () {
    let isExpanded = this.state.isExpanded;

    if (!isExpanded) document.getElementById('search-input').focus();
    this.setState({ isExpanded: !isExpanded, filter: '', filteredProjects: this.props.projects });
  }

  onBlur (e) {
    this.setState({ isExpanded: false });
  }

  onChangeProject (e) {
    let projectId = parseInt(e.target.attributes.getNamedItem('data-value').value);

    if (projectId !== this.state.selectedProject) {
      this.setState({
        selectedProject: _.find(this.props.projects, (p) => (
          p.id === projectId
        ))
      }, () => {
        this.props.updateProject(this.state.selectedProject);
      })

      this.setState({
        isExpanded: false
      })
    }
  }

  _renderProjectsList () {
    return <ProjectsList projects={this.state.filteredProjects} currentProject={this.state.selectedProject} onChangeProject={this.onChangeProject} />
  }

  render () {
    const { selectedProject, isExpanded, filter } = this.state;

    return (
      <div className="dropdown fluid search ui" style={{ 'minWidth': '90px' }} onClick={this.expandDropdown}>
        <input type="hidden" name="project" value="12" />
        <input placeholder="Project +" className="search" name="filter" value={filter} autoComplete="off" tabIndex="0" onChange={this.onFilterChange} id="search-input" />
        <div className={`text active ${(isExpanded ? 'hidden' : '')}`} style={{ background: `#${selectedProject.color}` }}>
          <div className="circular empty label ui" style={{ background: `#${selectedProject.color}` }} ></div>
          {selectedProject.name}
        </div>
        { isExpanded ? this._renderProjectsList() : null }
      </div>
    )
  }
}

export default ProjectsDropdown;
