import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import useFormHandler from '@hooks/use_form_handler';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';

const simpleDateFormat = (date) => moment(date).format('YYYY/MM/DD');

export default function NewCombinedReport(props) {
  const projectId = parseInt(props.match.params.projectId, 10);

  const [reports, setReports] = useState([]);
  const [gropuReport, setGropuReport, onChange] = useFormHandler({ name: '', report_ids: [] });
  const history = useHistory();

  function getReports() {
    Api.makeGetRequest({ url: `/api/projects/${projectId}/project_reports` })
      .then(({ data }) => setReports(data));
  }

  function selectReport(reportId) {
    const newrReportIds = _.xor(gropuReport.report_ids, [reportId]);
    setGropuReport({ ...gropuReport, report_ids: newrReportIds });
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
      body: { combined_report: gropuReport },
    }).then(({ data: report }) => {
      history.push(`/projects/${projectId}/combined_reports/${report.id}`);
    }).catch(() => {
      alert('Failed to create report');
    });
  }

  useEffect(() => {
    getReports();
  }, []);

  return (
    <div className="list-of-reports">
      <Helmet>
        <title>{I18n.t('common.reports')}</title>
      </Helmet>
      <form className="row" onSubmit={onSubmit}>
        <div className="form-group">
          <label>{I18n.t('common.name')}</label>
          <input
            className="form-control"
            name="name"
            onChange={onChange}
            value={gropuReport.name || ''}
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
                <th />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
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
                  <td className="report-actions text-right">
                    <input
                      type="checkbox"
                      checked={gropuReport.report_ids.includes(report.id)}
                      onChange={() => selectReport(report.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-right">
          <button type="submit" className="bt bt-main">
            {I18n.t('apps.combined_reports.combine_reports')}
          </button>
        </p>
      </form>
    </div>
  );
}
