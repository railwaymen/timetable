import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useInterval from 'react-useinterval';
import MilestoneEntry from './milestone_entry';
import { makeGetRequest, makePostRequest } from '../../shared/api';

function Milestones() {
  const { projectId } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [recounting, setRecounting] = useState(null);

  function getMilestones() {
    makeGetRequest({ url: `/api/projects/${projectId}/milestones` })
      .then((response) => {
        setMilestones(response.data);
      });
  }

  function importFromJira() {
    makePostRequest({ url: `/api/projects/${projectId}/milestones/import` })
      .then(() => {
        setRecounting(true);
      });
  }

  function getImportState() {
    makeGetRequest({
      url: `/api/projects/${projectId}/milestones/import_status`,
    }).then((response) => {
      setRecounting(!response.data.complete);
      if (response.data.complete) getMilestones();
    });
  }

  useInterval(getImportState, (recounting === null || recounting === true) ? 1000 : null);

  useEffect(() => {
    getMilestones();
  }, []);

  function renderImportButton() {
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
        <title>{I18n.t('common.project_milesontes')}</title>
      </Helmet>
      <div className="row mb-3">
        <div className="col-md-12 text-right">
          {renderImportButton()}
          <NavLink to={`/projects/${projectId}/milestones/new`} className="btn btn-secondary">{I18n.t('apps.milestones.add')}</NavLink>
        </div>
      </div>


      <div className="row">
        <table className="table">
          <thead>
            <tr>
              <th>{I18n.t('common.name')}</th>
              <th>{I18n.t('common.from')}</th>
              <th>{I18n.t('common.to')}</th>
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
    </div>
  );
}

export default Milestones;
