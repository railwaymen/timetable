import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import useFormHandler from '@hooks/use_form_handler';
import SynchronizeReport from '@components/time_table/project_reports/synchronize_report';
import * as Api from '../../shared/api';
import translateErrors from '../../shared/translate_errors';
import { displayDuration } from '../../shared/helpers';

export default function NewCombinedReport(props) {
  const projectId = parseInt(props.match.params.projectId, 10);

  const [reports, setReports] = useState([]);
  const [combinedReport, setCombinedReport, onChange] = useFormHandler({ name: '', report_ids: [] });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  function getReports() {
    Api.makeGetRequest({ url: `/api/projects/${projectId}/project_reports` })
      .then(({ data }) => setReports(data));
  }

  function selectReport(reportId) {
    const newrReportIds = _.xor(combinedReport.report_ids, [reportId]);
    setCombinedReport({ ...combinedReport, report_ids: newrReportIds });
  }

  function renderReportState(state) {
    const reportStates = {
      done: 'fa-check',
      editing: 'fa-pencil',
    };

    return (
      <span className="report-status">
        <i className={`symbol fa ${reportStates[state]}`} />
        {state}
      </span>
    );
  }

  function onSubmit(e) {
    e.preventDefault();

    Api.makePostRequest({
      url: `/api/projects/${projectId}/combined_reports`,
      body: { combined_report: combinedReport },
    }).then(({ data: report }) => {
      history.push(`/projects/${projectId}/combined_reports/${report.id}`);
    }).catch((results) => {
      if (results.errors) {
        setErrors(translateErrors('combined_report', results.errors));
      } else {
        alert('Failed to create report');
      }
    });
  }

  useEffect(() => {
    getReports();
  }, []);

  const saveDisabled = combinedReport.report_ids.length === 0;

  return (
    <div className="list-of-reports">
      <Helmet>
        <title>{I18n.t('common.reports')}</title>
      </Helmet>
      <form className="row" onSubmit={onSubmit}>
        <div className="form-group">
          {errors.base && (
            <div className="alert alert-danger">
              {errors.base.join(', ')}
            </div>
          )}
          <label>{I18n.t('common.name')}</label>
          {errors.name && <div className="error-description">{errors.name.join(', ')}</div>}
          <input
            className={`${errors.name ? 'error' : ''} form-control`}
            name="name"
            onChange={onChange}
            value={combinedReport.name || ''}
          />
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{I18n.t('common.name')}</th>
                <th className="text-center">{I18n.t('common.state')}</th>
                <th className="text-center">{I18n.t('common.range')}</th>
                <th className="text-center">{I18n.t('common.duration')}</th>
                <th className="text-center">{I18n.t('common.cost')}</th>
                <th colSpan={3} />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className={report.state === 'done' ? '' : 'text-muted'}>
                  <td>
                    {report.name}
                  </td>
                  <td className="text-center">
                    {renderReportState(report.state)}
                  </td>
                  <td className="text-center">
                    {`${moment(report.starts_at).formatDate()} - ${moment(report.ends_at).formatDate()}`}
                  </td>
                  <td className="text-center">
                    {displayDuration(report.duration)}
                  </td>
                  <td className="text-center">
                    {`${report.currency} ${report.cost.toFixed(2)}`}
                  </td>
                  <td className="text-center">
                    <SynchronizeReport url={`/api/projects/${projectId}/project_reports/${report.id}/synchronize`} />
                  </td>
                  <td>
                    {report.combined_reports_count > 0 &&(
                      <span className="text-danger">
                        {`! ${I18n.t('apps.combined_reports.already_used')}`}
                      </span>
                    )}
                  </td>
                  <td className="report-actions text-right">
                    <input
                      type="checkbox"
                      checked={combinedReport.report_ids.includes(report.id)}
                      onChange={() => selectReport(report.id)}
                      disabled={report.state !== 'done'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-right">
          <button type="submit" className={`bt ${saveDisabled ? 'bt-secondary' : 'bt-main'} `} disabled={saveDisabled}>
            {I18n.t('apps.combined_reports.combine_reports')}
          </button>
        </p>
      </form>
    </div>
  );
}
