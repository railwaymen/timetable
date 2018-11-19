import React from 'react';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api.js';
import { NavLink } from 'react-router-dom';
import _ from 'lodash';

import ProjectStats from './project_stats.js';

class Projects extends React.Component {
  constructor (props) {
    super(props);

    this.getProjects = this.getProjects.bind(this);
    this._renderGroupedRecords = this._renderGroupedRecords.bind(this);
    this.changeRange = this.changeRange.bind(this);
  }

  componentDidMount () {
    this.getProjects();
  }

  static propTypes = {
    projectsStats: PropTypes.object
  }

  state = {
    projectsStats: {},
    range: 30,
    projectKeys: []
  }

  getProjects () {
    Api.makeGetRequest({ url: `/api/projects?range=${this.state.range}` })
       .then((response) => {
         this.setState({ projectsStats: _.groupBy(response.data, 'name') });
       })
  }

  _renderGroupedRecords () {
    const projectKeys = Object.keys(this.state.projectsStats);

    return (
      projectKeys.map((key, index) => {
        let value = this.state.projectsStats[key];

        return (<ProjectStats stats={value} key={index + '/' + value.id} />);
      })
    )
  }

  changeRange (e) {
    this.setState({
      range: e.target.value
    }, () => { this.getProjects() });
  }

  render () {
    const { projectsStats, projectKeys } = this.state;
    const range = parseInt(this.state.range);

    return (
      <div>
        <div className="ui grid">
          <div className="sixteen wide column">
            <div className="btn-group pull-right">
              <NavLink className="btn btn-default active" exact to="/projects">{I18n.t('common.rank')}</NavLink>
              <NavLink className="btn btn-default" to="/projects/list">{I18n.t('common.all')}</NavLink>
            </div>
            <div className="btn-group pull-left">
              <select id="range" value={range} className="form-control" onChange={this.changeRange}>
                <option value="30">{I18n.t('apps.projects.last')} 30 {I18n.t('apps.projects.days')} </option>
                <option value="60">{I18n.t('apps.projects.last')} 60 {I18n.t('apps.projects.days')} </option>
                <option value="90">{I18n.t('apps.projects.last')} 90 {I18n.t('apps.projects.days')} </option>
              </select>
            </div>
          </div>
        </div>
        <div className="ui grid">
          { !_.isEmpty(projectsStats) ? this._renderGroupedRecords() : null }
        </div>
      </div>
    )
  }
}


export default Projects;
