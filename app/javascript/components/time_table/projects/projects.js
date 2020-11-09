import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Api from '../../shared/api';
import TypeFilter from './type_filter';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [visibility, setVisibility] = useState('active');
  const [type, setType] = useState('all');

  function getProjects() {
    Api.makeGetRequest({ url: `/api/projects?display=${visibility}&type=${type}` })
      .then((response) => {
        setProjects(response.data);
      });
  }
  useEffect(() => {
    getProjects();
  }, [visibility, type]);

  function renderEditButton(project) {
    if (currentUser.canManageProject(project)) {
      return (
        <NavLink className="ui button icon basic blue" to={`/projects/${project.id}/edit`}>
          <i className="fa fa-pencil" />
        </NavLink>
      );
    }
    return null;
  }

  function renderProjectName(project) {
    if (currentUser.canManageProject(project)) {
      return (
        <NavLink className="item" to={`/projects/${project.id}/work_times`}>{project.name}</NavLink>
      );
    }
    return project.name;
  }

  function renderProject(project) {
    return (
      <tr key={project.id}>
        <td>{renderProjectName(project)}</td>
        <td>{project.leader_name}</td>
        <td>
          <div className="ui buttons">
            {renderEditButton(project)}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <Helmet>
        <title>{I18n.t('common.projects')}</title>
      </Helmet>
      <div className="clearfix mb-3">
        <div className="btn-group pull-right">
          <NavLink className="btn btn-secondary" exact to="/projects/ranking">{I18n.t('common.rank')}</NavLink>
          <NavLink className="btn btn-secondary" exact to="/projects/progress">{I18n.t('apps.milestones.progress')}</NavLink>
          <NavLink className="btn btn-secondary active" exact to="/projects">{I18n.t('common.all')}</NavLink>
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
          <TypeFilter type={type} setType={setType} />
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{I18n.t('apps.projects.name')}</th>
            <th>{I18n.t('apps.projects.leader')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects.map(renderProject)}
        </tbody>
      </table>
    </>
  );
}

export default Projects;
