import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import * as Api from '../../shared/api';
import ProjectStats from './project_stats';
import RangeFilter from './range_filter';
import TypeFilter from './type_filter';

function Projects() {
  const [projectsStats, setProjectsStats] = useState([]);
  const [range, setRange] = useState(30);
  const [type, setType] = useState('commercial');

  function getProjects() {
    Api.makeGetRequest({ url: `/api/projects?range=${range}&type=${type}` })
      .then((response) => {
        setProjectsStats(response.data);
      });
  }

  function renderGroupedRecords() {
    return _.map(projectsStats, (value) => <ProjectStats stats={value} key={value.project_id} />);
  }

  useEffect(() => {
    getProjects();
  }, [range, type]);

  return (
    <div>
      <Helmet>
        <title>{I18n.t('common.projects')}</title>
      </Helmet>
      <header className="page-header">
        <div className="clearfix mb-3">
          <div className="btn-group pull-right">
            <NavLink className="btn btn-secondary active" exact to="/projects">{I18n.t('common.rank')}</NavLink>
            <NavLink className="btn btn-secondary" to="/projects/list">{I18n.t('common.all')}</NavLink>
          </div>
          { currentUser.isSuperUser() && (
            <div className="btn-group pull-left">
              <NavLink to="/projects/new" className="btn btn-secondary pull-left">{I18n.t('common.add')}</NavLink>
            </div>
          )}
          <div className="btn-group pull-left">
            <RangeFilter range={range} setRange={setRange} />
          </div>
          <div className="btn-group pull-left">
            <TypeFilter type={type} setType={setType} />
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
