import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SynchronizeReport from '@components/time_table/project_reports/synchronize_report';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';

export default function CombinedReports(props) {
  const projectId = parseInt(props.match.params.projectId, 10);
  const [reports, setReports] = useState([]);

  function getReports() {
    Api.makeGetRequest({ url: `/api/projects/${projectId}/combined_reports` })
      .then(({ data }) => setReports(data));
  }

  function onDelete(reportId) {
    if (window.confirm(I18n.t('common.confirm'))) {
      Api.makeDeleteRequest({ url: `/api/combined_reports/${reportId}` })
        .then(() => getReports());
    }
  }

  useEffect(() => {
    getReports();
  }, []);

  return (
    <div className="list-of-reports">
      <Helmet>
        <title>{I18n.t('common.combined_reports')}</title>
      </Helmet>
      <div className="reports-nav">
        <div className="btn-group pull-right">
          <Link className="btn btn-default" to={`/projects/${projectId}/reports`}>
            {I18n.t('common.reports')}
          </Link>
          <Link className="btn btn-default active" to={`/projects/${projectId}/combined_reports`}>
            {I18n.t('common.combined_reports')}
          </Link>
        </div>
        <div className="text-right">
          <Link to={`/projects/${projectId}/new_combined_report`} className="bt bt-main">
            <i className="symbol fa fa-plus" />
            <span className="bt-txt">{I18n.t('apps.combined_reports.new')}</span>
          </Link>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>{I18n.t('common.name')}</th>
              <th className="text-center">{I18n.t('common.range')}</th>
              <th className="text-center">{I18n.t('common.duration')}</th>
              <th className="text-center">{I18n.t('common.cost')}</th>
              <th colSpan={2} />
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  {report.name}
                </td>
                <td className="text-center">
                  {`${moment(report.starts_at).formatDate()} - ${moment(report.ends_at).formatDate()}`}
                </td>
                <td className="text-center">
                  {displayDuration(report.duration_sum)}
                </td>
                <td className="text-center">
                  {`${report.currency} ${parseFloat(report.cost, 10).toFixed(2)}`}
                </td>
                <td>
                  <SynchronizeReport url={`/api/combined_reports/${report.id}/synchronize`} />
                </td>
                <td className="report-actions text-right">
                  {report.generated && (
                    <a className="bt bt-second bt-download" href={`/api/combined_reports/${report.id}/file`}>
                      <i className="symbol fa fa-file-pdf-o" />
                      <span className="txt">{I18n.t('common.download')}</span>
                    </a>
                  )}
                  <Link className="bt bt-second" to={`/projects/${projectId}/combined_reports/${report.id}`}>
                    <i className="symbol fa fa-search" />
                    <span className="bt-txt">{I18n.t('common.show')}</span>
                  </Link>
                  <button type="button" className="bt bt-danger" onClick={() => onDelete(report.id)}>
                    <i className="symbol fa fa-trash-o" />
                    <span className="bt-txt">{I18n.t('apps.reports.remove')}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
