import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Api from '../../shared/api';
import Project from './project';
import RangeFilter from './range_filter';
import TypeFilter from './type_filter';
import SortOptions from './sort_options';

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [visibility, setVisibility] = useState('active');
  const [milestones, setMilestones] = useState([]);
  const [range, setRange] = useState('');
  const [sort, setSort] = useState('hours');
  const [type, setType] = useState('all');

  function getProjects() {
    Api.makeGetRequest({ url: `/api/projects/list?display=${visibility}&range=${range}&type=${type}&sort=${sort}` })
      .then((response) => {
        setProjects(response.data);
      });
  }

  function getCurrentMilestones() {
    const projectIds = projects.map((p) => p.id);
    Api.makeGetRequest({ url: `/api/projects/current_milestones?projects=${projectIds}` })
      .then((response) => {
        setMilestones(response.data);
      });
  }

  useEffect(() => {
    if (projects.length > 0) getCurrentMilestones();
  }, [projects]);

  useEffect(() => {
    getProjects();
  }, [visibility, range, type, sort]);

  function findMilestone(project_id) {
    return milestones.find((a) => a.project_id === project_id);
  }

  return (
    <>
      <Helmet>
        <title>{I18n.t('common.projects')}</title>
      </Helmet>
      <div className="clearfix mb-3">
        <div className="btn-group pull-right">
          <NavLink className="btn btn-secondary" exact to="/projects">{I18n.t('common.rank')}</NavLink>
          <NavLink className="btn btn-secondary active" to="/projects/list">{I18n.t('common.all')}</NavLink>
        </div>
        { currentUser.isSuperUser() && (
          <NavLink to="/projects/new" className="btn btn-secondary pull-left">{I18n.t('common.add')}</NavLink>
        )}
        <div className="btn-group pull-left">
          <select
            name="visibility"
            id="filter"
            className="form-control"
            onChange={(e) => setVisibility(e.target.value)}
            value={visibility}
          >
            <option value="active">{I18n.t('apps.projects.filter_active')}</option>
            <option value="inactive">{I18n.t('apps.projects.filter_inactive')}</option>
            <option value="all">{I18n.t('apps.projects.filter_all')}</option>
          </select>
        </div>
        <div className="btn-group pull-left">
          <RangeFilter range={range} setRange={setRange} />
        </div>
        <div className="btn-group pull-left">
          <TypeFilter type={type} setType={setType} />
        </div>
        <div className="btn-group pull-left">
          <SortOptions sort={sort} setSort={setSort} />
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th />
            <th>{I18n.t('apps.projects.name')}</th>
            <th>{I18n.t('apps.projects.leader')}</th>
            <th>{I18n.t('common.people')}</th>
            <th>{I18n.t('apps.milestones.progress')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          { projects.map((project) => (
            <Project key={project.id} project={project} milestone={findMilestone(project.id)} />
          )) }
        </tbody>
      </table>
    </>
  );
}

export default ProjectsList;
