import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import _ from 'lodash';
import * as Api from '../../shared/api';
import ProjectStats from './project_stats';

class Projects extends React.Component {
  constructor(props) {
    super(props);

    this.getProjects = this.getProjects.bind(this);
    this.renderGroupedRecords = this.renderGroupedRecords.bind(this);
    this.changeRange = this.changeRange.bind(this);
  }

  componentDidMount() {
    this.getProjects();
  }

  static propTypes = {
    projectsStats: PropTypes.object,
  }

  state = {
    projectsStats: {},
    range: 30,
  }

  getProjects() {
    Api.makeGetRequest({ url: `/api/projects?range=${this.state.range}` })
      .then((response) => {
        this.setState({ projectsStats: _.groupBy(response.data, 'name') });
      });
  }

  renderGroupedRecords() {
    const projectKeys = Object.keys(this.state.projectsStats);

    return (
      projectKeys.map((key) => {
        const value = this.state.projectsStats[key];

        return (<ProjectStats stats={value} key={key} />);
      })
    );
  }

  changeRange(e) {
    this.setState({
      range: e.target.value,
    }, () => { this.getProjects(); });
  }

  renderOption(value) {
    return (
      <option value={value}>
        {[I18n.t('apps.projects.last'), String(value), I18n.t('apps.projects.days')].join(' ')}
      </option>
    );
  }

  render() {
    const { projectsStats } = this.state;
    const range = parseInt(this.state.range, 10);

    return (
      <div>
        <header className="page-header">
          <div className="ui grid">
            <div className="sixteen wide column">
              <div className="btn-group pull-right">
                <NavLink className="btn btn-default active" exact to="/projects">{I18n.t('common.rank')}</NavLink>
                <NavLink className="btn btn-default" to="/projects/list">{I18n.t('common.all')}</NavLink>
              </div>
              <div className="btn-group pull-left">
                <select id="range" value={range} className="form-control" onChange={this.changeRange}>
                  {this.renderOption(30)}
                  {this.renderOption(60)}
                  {this.renderOption(90)}
                </select>
              </div>
            </div>
          </div>
        </header>
        <div className="row row-eq-height projects-cards">
          { !_.isEmpty(projectsStats) ? this.renderGroupedRecords() : null }
        </div>
      </div>
    );
  }
}


export default Projects;
