import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import _ from 'lodash';
import * as Api from '../../shared/api';
import ProjectStats from './project_stats';

function Projects() {
  const [projectsStats, setProjectsStats] = useState([]);
  const [range, setRange] = useState(30);

  function getProjects() {
    Api.makeGetRequest({ url: `/api/projects?range=${range}` })
      .then((response) => {
        setProjectsStats(_.groupBy(response.data, 'name'));
      });
  }

  function renderGroupedRecords() {
    return _.map(projectsStats, (value, key) => <ProjectStats stats={value} key={key} />);
  }

  function renderOption(value) {
    return (
      <option value={value}>
        {`${I18n.t('apps.projects.last')} ${String(value)} ${I18n.t('apps.projects.days')}`}
      </option>
    );
  }

  useEffect(() => {
    getProjects();
  }, [range]);

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
              <select id="range" value={range} className="form-control" onChange={(e) => setRange(e.target.value)}>
                {renderOption(30)}
                {renderOption(60)}
                {renderOption(90)}
              </select>
            </div>
          </div>
        </div>
      </header>
      <div className="row row-eq-height projects-cards">
        { !_.isEmpty(projectsStats) && renderGroupedRecords() }
      </div>
    </div>
  );
}

export default Projects;
