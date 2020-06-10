import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useFormHandler from '@hooks/use_form_handler';
import Preloader from '../../shared/preloader';
import translateErrors from '../../shared/translate_errors';
import * as Api from '../../shared/api';

function EditProject(props) {
  const projectId = parseInt(props.match.params.id, 10);

  const defaultProjectParams = {
    name: '',
    color: '0c0c0c',
    leader_id: '',
    external_id: '',
    work_times_allows_task: true,
    external_integration_enabled: true,
    active: true,
  };

  const [project, setProject, onChange] = useFormHandler(defaultProjectParams);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
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
        .then(() => setRedirectToReferer('/projects/list'))
        .catch((results) => setErrors(translateErrors('project', results.errors)));
    } else {
      Api.makePostRequest({ url: '/api/projects', body: { project } })
        .then(() => setRedirectToReferer('/projects/list'))
        .catch((results) => setErrors(translateErrors('project', results.errors)));
    }
  }

  useEffect(() => {
    getProject();
    if (currentUser.isManager()) getUsers();
  }, []);

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
        <form>
          {currentUser.isSuperUser() && (
            <div>
              <div className="form-group">
                {errors.name && <div className="error-description">{errors.name.join(', ')}</div>}
                <input
                  className={`${errors.name ? 'error' : ''} form-control`}
                  type="text"
                  name="name"
                  placeholder={I18n.t('common.name')}
                  onChange={onChange}
                  value={project.name}
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
              <div className="form-group">
                <label>
                  {I18n.t('apps.projects.active')}
                  <input type="checkbox" name="active" checked={project.active} onChange={onChange} />
                </label>
              </div>
            </div>
          )}
          <div className="form-group" />
          <input
            type="color"
            name="color"
            value={((project.color && project.color[0] !== '#') ? '#' : '') + project.color}
            onChange={onChange}
          />
          <div className="form-group">
            <label>
              {I18n.t('apps.projects.work_times_allows_task')}
              <input
                type="checkbox"
                name="work_times_allows_task"
                checked={project.work_times_allows_task}
                onChange={onChange}
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              {I18n.t('apps.projects.external_integration_enabled')}
              <input
                type="checkbox"
                name="external_integration_enabled"
                checked={project.external_integration_enabled}
                onChange={onChange}
              />
            </label>
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
            </div>
          )}
          <NavLink className="btn btn-secondary" to="/projects/list">{I18n.t('common.cancel')}</NavLink>
          <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={onSubmit} />
        </form>
      </>
    );
  }
  return <Preloader rowsNumber={5} />;
}

export default EditProject;
