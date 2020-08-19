import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ProjectsList from './projects_list';

class ProjectsDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.hideDropdown = this.hideDropdown.bind(this);
    this.expandDropdown = this.expandDropdown.bind(this);
    this.renderProjectsList = this.renderProjectsList.bind(this);
    this.onChangeProject = this.onChangeProject.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.handleCurrentIndexIncrement = this.handleCurrentIndexIncrement.bind(this);
    this.handleCurrentIndexDecrement = this.handleCurrentIndexDecrement.bind(this);

    this.state = {
      currentIndex: 0,
      isExpanded: false,
      filter: '',
      filteredProjects: this.filterProjects(''),
    };

    this.searchRef = React.createRef();
  }

  componentDidMount() {
    this.setState({
      filteredProjects: this.filterProjects(),
    });
  }

  onFilterChange(e) {
    this.setState({
      filter: e.target.value,
      filteredProjects: this.filterProjects(e.target.value),
    });
  }

  onKeyDown(e) {
    const { filteredProjects, currentIndex } = this.state;
    if ((e.keyCode === 13 || e.keyCode === 9) && filteredProjects.length > 0) {
      e.preventDefault();
      const projects = this.filterProjects();
      const selectedProject = _.find(projects, (p) => (
        p.id === filteredProjects[0]
      )) || projects[currentIndex];

      this.props.updateProject(selectedProject, e.shiftKey);
      this.setState({ currentIndex: 0 });
      this.hideDropdown();
    }
    if (e.keyCode === 40) {
      this.handleCurrentIndexIncrement();
    } else if (e.keyCode === 38) {
      this.handleCurrentIndexDecrement();
    }
  }

  onBlur() {
    this.setState({ isExpanded: false });
  }

  onChangeProject(e) {
    const projectId = parseInt(e.target.attributes.getNamedItem('data-value').value, 10);

    if (projectId !== this.props.selectedProject) {
      const projects = this.filterProjects('');
      const selectedProject = _.find(projects, (p) => (
        p.id === projectId
      )) || projects[0];

      this.hideDropdown();
      this.props.updateProject(selectedProject);
    }
  }

  expandDropdown() {
    this.setState({ isExpanded: true, filter: '', filteredProjects: this.filterProjects('') }, () => {
      document.addEventListener('click', this.hideDropdown);
    });
  }

  hideDropdown(e) {
    if (e && e.target === this.searchRef.current) return; // Do not hide when click is on search input
    document.removeEventListener('click', this.hideDropdown);
    this.setState({ isExpanded: false, filter: '', filteredProjects: this.filterProjects('') });
  }

  filterProjects(filter = this.state.filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(this.props.projects, (p) => (
      p.active && p.name.toLowerCase().match(escape(lowerFilter))
    ));
  }

  handleCurrentIndexIncrement() {
    const { filteredProjects, currentIndex } = this.state;
    if (currentIndex + 1 < filteredProjects.length) {
      this.setState({ currentIndex: currentIndex + 1 });
    }
  }

  handleCurrentIndexDecrement() {
    const { currentIndex } = this.state;
    if (currentIndex - 1 >= 0) {
      this.setState({ currentIndex: currentIndex - 1 });
    }
  }

  renderProjectsList() {
    return (
      <div style={{ marginTop: '15px' }}>
        <ProjectsList
          projects={this.state.filteredProjects}
          currentIndex={this.state.currentIndex}
          currentProject={this.props.selectedProject}
          onChangeProject={this.onChangeProject}
        />
      </div>
    );
  }

  render() {
    const { isExpanded, filter } = this.state;
    const { selectedProject } = this.props;

    return (
      <div className="dropdown fluid search ui" style={{ minWidth: '90px' }}>
        <input type="hidden" name="project" value="12" />
        <input
          placeholder="Project"
          onFocus={this.expandDropdown}
          ref={this.searchRef}
          className="form-control input-search"
          name="filter"
          value={filter}
          autoComplete="off"
          tabIndex="0"
          onChange={this.onFilterChange}
          id="search-input"
          onKeyDown={this.onKeyDown}
        />
        <div className={`text active ${(isExpanded ? 'hidden' : '')}`} style={{ background: `#${selectedProject.color}` }} onClick={this.expandDropdown}>
          <div className="circular empty label ui" style={{ background: `#${selectedProject.color}` }} />
          {selectedProject.name}
        </div>
        {isExpanded && this.renderProjectsList()}
      </div>
    );
  }
}

ProjectsDropdown.propTypes = {
  projects: PropTypes.array,
  selectedProject: PropTypes.object,
};

export default ProjectsDropdown;
