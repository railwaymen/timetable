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

  function renderReportState(state) {
    const iconClass = ({
      done: 'fa-check',
      editing: 'fa-pencil',
    })[state] || 'fa-info-circle';
    return (
      <span className="report-status">
        <i className={`symbol fa ${iconClass}`} />
        {state}
      </span>
    );
  }

  useEffect(() => {
    getReport();
  }, []);

  return (
    <div>
      <h1>{report.name}</h1>
      <Helmet>
        {/* TODO: poprawić */}
        <title>{I18n.t('common.reports')}</title>
      </Helmet>
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
            {report.project_reports.map((project_report) => (
              <tr key={project_report.id}>
                <td>
                  {project_report.name}
                </td>
                <td className="text-center">
                  {renderReportState(project_report.state)}
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
                  <SynchronizeReport id={project_report.id} projectId={project_report.project_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// CombinedReport.propTypes = {

// }

export default CombinedReport;
