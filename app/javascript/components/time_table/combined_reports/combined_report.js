import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import SynchronizeReport from '@components/time_table/project_reports/synchronize_report';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';

function CombinedReport(props) {
  const reportId = parseInt(props.match.params.id, 10);
  const [report, setReport] = useState({ project_reports: [] });

  function getReport() {
    Api.makeGetRequest({ url: `/api/combined_reports/${reportId}` })
      .then(({ data }) => setReport(data));
  }

  function refresh() {
    getReport();
  }

  useEffect(() => {
    getReport();
  }, []);

  return (
    <div className="list-of-reports">
      <Helmet>
        <title>{`${I18n.t('apps.combined_reports.combined_report')} - ${report.name}`}</title>
      </Helmet>
      <div className="reports-nav">
        <h1>{report.name}</h1>
        {report.generated ? (
          <a className="bt bt-second bt-download" href={`/api/combined_reports/${report.id}/file`}>
            <i className="symbol fa fa-file-pdf-o" />
            <span className="txt">{I18n.t('common.download')}</span>
          </a>
        ) : (
          <a onClick={refresh} className="bt bt-second">
            <span className="bt-txt">{I18n.t('common.refresh')}</span>
            <i className="symbol fa fa-repeat" />
          </a>
        )}
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
            {report.project_reports.map((project_report) => (
              <tr key={project_report.id}>
                <td>
                  {project_report.name}
                </td>
                <td className="text-center">
                  {`${moment(project_report.starts_at).formatDate()} - ${moment(project_report.ends_at).formatDate()}`}
                </td>
                <td className="text-center">
                  {displayDuration(project_report.duration)}
                </td>
                <td className="text-center">
                  {`${project_report.currency} ${project_report.cost.toFixed(2)}`}
                </td>
                <td className="text-center">
                  <SynchronizeReport
                    url={`/api/projects/${project_report.project_id}/project_reports/${project_report.id}/synchronize`}
                  />
                </td>
                <td className="text-center">
                  {project_report.combined_reports_count > 1 && (
                    <span className="text-danger">
                      {`! ${I18n.t('apps.combined_reports.already_used')}`}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <strong>{I18n.t('common.total')}</strong>
              </td>
              <td className="text-center">
                <strong>{`${moment(report.starts_at).formatDate()} - ${moment(report.ends_at).formatDate()}`}</strong>
              </td>
              <td className="text-center">
                <strong>{displayDuration(report.duration_sum)}</strong>
              </td>
              <td className="text-center">
                <strong>{`${report.currency} ${parseFloat(report.cost, 10).toFixed(2)}`}</strong>
              </td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CombinedReport;
