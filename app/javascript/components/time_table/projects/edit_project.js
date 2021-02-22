import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useFormHandler from '@hooks/use_form_handler';
import Preloader from '../../shared/preloader';
import translateErrors from '../../shared/translate_errors';
import * as Api from '../../shared/api';
import Breadcrumb from '../../shared/breadcrumb';

function EditProject(props) {
  const projectId = parseInt(props.match.params.id, 10);

  const defaultProjectParams = {
    name: '',
    color: '0c0c0c',
    leader_id: '',
    external_id: '',
    work_times_allows_task: true,
    tags_enabled: true,
    external_integration_enabled: false,
    active: true,
  };

  const [project, setProject, onChange] = useFormHandler(defaultProjectParams);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [crumbs, setCrumbs] = useState([]);
  const [redirectToReferer, setRedirectToReferer] = useState();

  function getProject() {
    if (!projectId) return;

    Api.makeGetRequest({ url: `/api/projects/${projectId}` })
      .then((response) => {
        setProject(response.data);
      });
  }

  function getUsers() {
    Api.makeGetRequest({ url: '/api/users' })
      .then((response) => setUsers(response.data));
  }

  function onSubmit(e) {
    e.preventDefault();

    project.color = project.color[0] === '#' ? project.color.substring(1) : project.color;

    if (projectId) {
      Api.makePutRequest({ url: `/api/projects/${project.id}`, body: { project } })
        .then(() => setRedirectToReferer('/projects'))
        .catch((results) => setErrors(translateErrors('project', results.errors)));
    } else {
      Api.makePostRequest({ url: '/api/projects', body: { project } })
        .then(() => setRedirectToReferer('/projects'))
        .catch((results) => setErrors(translateErrors('project', results.errors)));
    }
  }

  useEffect(() => {
    getProject();
    if (currentUser.isManager()) getUsers();
  }, []);

  useEffect(() => {
    if (project.name) {
      setCrumbs([
        { href: '/projects', label: I18n.t('common.projects') },
        { label: project.name },
      ]);
    }
    if (Number.isNaN(projectId) === true) {
      setCrumbs([
        { href: '/projects', label: I18n.t('common.projects') },
        { label: I18n.t('apps.projects.new') },
      ]);
    }
  }, [project]);

  if (redirectToReferer) return <Redirect to={redirectToReferer} />;

  if (!projectId || projectId === project.id) {
    return (
      <>
        <Helmet>
          {project.id ? (
            <title>{`${I18n.t('common.edit')} ${project.name}`}</title>
          ) : (
            <title>{I18n.t('apps.projects.new')}</title>
          )}
        </Helmet>
        <Breadcrumb crumbs={crumbs} />
        <form>
          {currentUser.isSuperUser() && (
            <>
              <div className="form-group">
                <label htmlFor="name">{I18n.t('common.name')}</label>
                {errors.name && <div className="error-description">{errors.name.join(', ')}</div>}
                <input
                  id="name"
                  className={`${errors.name ? 'error' : ''} form-control`}
                  type="text"
                  name="name"
                  placeholder={I18n.t('common.name')}
                  onChange={onChange}
                  value={project.name}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tag">{I18n.t('common.tag')}</label>
                {errors.tag && <div className="error-description">{errors.tag.join(', ')}</div>}
                <input
                  id="tag"
                  className={`${errors.tag ? 'error' : ''} form-control`}
                  type="text"
                  name="tag"
                  placeholder={I18n.t('common.tag')}
                  onChange={onChange}
                  value={project.tag}
                />
              </div>
              <div className="form-group">
                <label htmlFor="leader">{I18n.t('apps.projects.leader')}</label>
                <select
                  name="leader_id"
                  id="leader"
                  className="form-control"
                  value={project.leader_id || ''}
                  onChange={onChange}
                >
                  <option value="" />
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {currentUser.fullName.apply(user)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group form-check">
                <input
                  id="active"
                  type="checkbox"
                  className="form-check-input"
                  name="active"
                  checked={project.active}
                  onChange={onChange}
                />
                <label className="form-check-label" htmlFor="active">
                  {I18n.t('common.active')}
                </label>
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="color">
              {I18n.t('apps.projects.color')}
              :
            </label>
            <input
              id="color"
              type="color"
              name="color"
              value={((project.color && project.color[0] !== '#') ? '#' : '') + project.color}
              onChange={onChange}
            />
          </div>
          <div className="form-group form-check">
            <input
              id="work_times_allows_task"
              type="checkbox"
              className="form-check-input"
              name="work_times_allows_task"
              checked={project.work_times_allows_task}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="work_times_allows_task">
              {I18n.t('apps.projects.work_times_allows_task')}
            </label>
          </div>
          <div className="form-group form-check">
            <input
              id="billable"
              type="checkbox"
              className="form-check-input"
              name="billable"
              checked={project.billable}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="billable">
              {I18n.t('apps.projects.billable')}
            </label>
          </div>
          <div className="form-group form-check">
            <input
              id="tags_enabled"
              type="checkbox"
              className="form-check-input"
              name="tags_enabled"
              checked={project.tags_enabled}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="tags_enabled">
              {I18n.t('apps.projects.tags_enabled')}
            </label>
          </div>
          <div className="form-group form-check">
            <input
              id="external_integration_enabled"
              type="checkbox"
              className="form-check-input"
              name="external_integration_enabled"
              checked={project.external_integration_enabled}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="external_integration_enabled">
              {I18n.t('apps.projects.external_integration_enabled')}
            </label>
            <small className="form-text text-muted">
              {I18n.t('apps.projects.external_integration_help')}
            </small>
          </div>
          {project.external_integration_enabled && (
            <div className="form-group">
              {errors.externalId && <div className="error-description">{errors.externalId.join(', ')}</div>}
              <input
                className={`${errors.externalId ? 'error' : ''} form-control`}
                type="text"
                name="external_id"
                placeholder={I18n.t('apps.projects.external_id')}
                onChange={onChange}
                value={project.external_id}
              />
              <small className="form-text text-muted">
                {I18n.t('apps.projects.external_id_help')}
              </small>
            </div>
          )}
          <NavLink className="btn btn-secondary" to="/projects">{I18n.t('common.cancel')}</NavLink>
          <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={onSubmit} />
        </form>
      </>
    );
  }
  return <Preloader rowsNumber={5} />;
}

export default EditProject;
