import React, { useState, useEffect } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import useFormHandler from '@hooks/use_form_handler';
import { defaultDatePickerProps } from '@components/shared/helpers';
import ErrorTooltip from '@components/shared/error_tooltip';
import translateErrors from '@components/shared/translate_errors';
import { makeGetRequest, makePostRequest, makePutRequest } from '../../shared/api';
import MilestoneEstimateEntry from './milestone_estimate_entry';
import { Helmet } from 'react-helmet';

const MilestoneEstimates = () => {
  const history = useHistory();
  const { projectId, id } = useParams();
  const [estimates, setEstimates] = useState([]);

  function getEstimates() {
    makeGetRequest({ url: `/api/projects/${projectId}/milestones/${id}/estimates` })
      .then((response) => {
        setEstimates(response.data);
      });
  }

  useEffect(() => {
    getEstimates();
  }, []);

  return (
    <div>
      <Helmet>
        <title>{I18n.t('common.project_milesontes')}</title>
      </Helmet>

      <div className="row">
        <table id="milestone-estimates" className="table">
          <thead>
            <tr>
              <th>{I18n.t('apps.milestones.change')}</th>
              <th>{I18n.t('apps.department.dev')}</th>
              <th>{I18n.t('apps.department.qa')}</th>
              <th>{I18n.t('apps.department.ux')}</th>
              <th>{I18n.t('apps.department.pm')}</th>
              <th>{I18n.t('apps.department.other')}</th>
              <th>JIRA</th>
              <th>{I18n.t('common.description')}</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((estimate) => (

              <MilestoneEstimateEntry
                key={estimate.id}
                estimate={estimate}
              />
            ))}
          </tbody>
        </table>

        <div className="btn-group">
          <NavLink className="btn btn-secondary" to={`/projects/${projectId}/milestones`}>{I18n.t('common.back')}</NavLink>
        </div>
      </div>
    </div>
  );
};

export default MilestoneEstimates;
