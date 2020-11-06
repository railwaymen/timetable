import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useInterval from 'react-useinterval';
import MilestoneEntry from './milestone_entry';
import { makeGetRequest, makePostRequest, makePutRequest } from '../../shared/api';
import Breadcrumb from '../../shared/breadcrumb';

function Milestones() {
  const { projectId } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [crumbs, setCrumbs] = useState([]);
  const [project, setProject] = useState({});
  const [recounting, setRecounting] = useState(null);

  function getMilestones() {
    makeGetRequest({ url: `/api/projects/${projectId}/milestones?with_estimates=true` })
      .then((response) => {
        setMilestones(response.data);
      });
  }

  function getProject() {
    makeGetRequest({ url: `/api/projects/${projectId}` })
      .then((response) => {
        setProject(response.data);
      });
  }

  function importFromJira() {
    makePostRequest({ url: `/api/projects/${projectId}/milestones/import` })
      .then(() => {
        setRecounting(true);
      });
  }

  function updateProject() {
    const value = !project.milestones_import_enabled;
    makePutRequest({ url: `/api/projects/${projectId}`, body: { milestones_import_enabled: value } });
    setProject({ ...project, milestones_import_enabled: value });
  }

  function getImportState() {
    makeGetRequest({
      url: `/api/projects/${projectId}/milestones/import_status`,
    }).then((response) => {
      setRecounting(!response.data.complete);
      if (recounting === true && response.data.complete) getMilestones();
    });
  }

  useInterval(getImportState, (project.external_integration_enabled === true && (recounting === null || recounting === true)) ? 1000 : null);

  useEffect(() => {
    getMilestones();
    getProject();
  }, []);

  useEffect(() => {
    if (project.name) {
      setCrumbs([
        { href: '/projects', label: I18n.t('common.projects') },
        { href: `/projects/${projectId}/work_times`, label: project.name },
        { label: I18n.t('common.project_milestones') },
      ]);
    }
  }, [project]);

  function renderEnableImportButton() {
    if (project.external_integration_enabled === false) {
      return (
        <button type="button" disabled="disabled" className="btn btn-secondary" title={I18n.t('apps.milestones.jira_not_available')}>
          {I18n.t('apps.milestones.enable_import_milestones')}
        </button>
      );
    }
    return (
      <button type="button" className="btn btn-secondary" onClick={updateProject}>
        {project.milestones_import_enabled === false && I18n.t('apps.milestones.enable_import_milestones')}
        {project.milestones_import_enabled === true && I18n.t('apps.milestones.disable_import_milestones')}
      </button>
    );
  }

  function renderImportButton() {
    if (project.external_integration_enabled === false) {
      return (
        <button type="button" disabled="disabled" className="btn btn-secondary" title={I18n.t('apps.milestones.jira_not_available')}>
          {I18n.t('apps.milestones.import_from_jira')}
        </button>
      );
    }
    if (recounting === null) {
      return <button type="button" disabled="disabled" className="btn btn-secondary">{I18n.t('apps.milestones.import_from_jira')}</button>;
    }
    if (recounting === true) {
      return <button type="button" disabled="disabled" className="btn btn-secondary">{I18n.t('apps.milestones.import_in_progress')}</button>;
    }
    return <button type="button" className="btn btn-secondary" onClick={importFromJira}>{I18n.t('apps.milestones.import_from_jira')}</button>;
  }

  return (
    <div>
      <Helmet>
        <title>
          {[project.name, I18n.t('common.project_milestones')].join(' - ')}
        </title>
      </Helmet>
      <Breadcrumb crumbs={crumbs} />
      <div className="row mb-3">
        <div className="col-md-12 text-right">
          <div className="btn-group">
            {renderEnableImportButton()}
            {renderImportButton()}
            <NavLink to={`/projects/${projectId}/milestones/new`} className="btn btn-secondary">{I18n.t('apps.milestones.add')}</NavLink>
          </div>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>{I18n.t('common.name')}</th>
            <th>{I18n.t('common.from')}</th>
            <th>{I18n.t('common.to')}</th>
            <th>{I18n.t('common.state')}</th>
            <th>{I18n.t('apps.milestones.estimate')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {milestones.map((milestone) => (

            <MilestoneEntry
              key={milestone.id}
              milestone={milestone}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Milestones;
