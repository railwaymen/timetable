import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';
import SynchronizeReport from './synchronize_report';

const simpleDateFormat = (date) => moment(date).format('YYYY/MM/DD');

export default function ProjectReports(props) {
  const projectId = parseInt(props.match.params.projectId, 10);
  const [reports, setReports] = useState([]);

  function getReports() {
    Api.makeGetRequest({ url: `/api/projects/${projectId}/project_reports` })
      .then(({ data }) => setReports(data));
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

  function onDelete(e) {
    e.preventDefault();

    if (window.confirm(I18n.t('common.confirm'))) {
      Api.makeDeleteRequest({ url: e.currentTarget.href }).then((data) => {
        if (parseInt(data.status, 10) === 204) {
          getReports();
        }
      });
    }
  }

  useEffect(() => {
    getReports();
  }, []);

  return (
    <div className="list-of-reports">
      <Helmet>
        <title>{I18n.t('common.reports')}</title>
      </Helmet>
      <div className="reports-nav">
        <div className="btn-group pull-right">
          <Link className="btn btn-default active" to={`/projects/${projectId}/reports`}>
            {I18n.t('common.reports')}
          </Link>
          <Link className="btn btn-default" to={`/projects/${projectId}/combined_reports`}>
            {I18n.t('common.combined_reports')}
          </Link>
        </div>
        <div className="text-right">
          <Link to={`/projects/${projectId}/new_report`} className="bt bt-main">
            <i className="symbol fa fa-plus" />
            <span className="bt-txt">{I18n.t('apps.reports.new')}</span>
          </Link>
        </div>
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
                  {`${simpleDateFormat(report.starts_at)}-${simpleDateFormat(report.ends_at)}`}
                </td>
                <td className="text-center">
                  {displayDuration(report.duration)}
                </td>
                <td className="text-center">
                  {report.currency}
                  {' '}
                  {report.cost.toFixed(2)}
                </td>
                <td className="text-center">
                  <SynchronizeReport id={report.id} projectId={projectId} />
                </td>
                <td className="report-actions text-right">
                  {report.generated && (
                    <a
                      className="bt bt-second bt-download"
                      href={`/api/projects/${projectId}/project_reports/${report.id}/file`}
                    >
                      <i className="symbol fa fa-file-pdf-o" />
                      <span className="txt">{I18n.t('common.download')}</span>
                    </a>
                  )}
                  <Link className="bt bt-second" to={`/projects/${projectId}/edit_report/${report.id}`}>
                    <i className="symbol fa fa-search" />
                    <span className="bt-txt">{I18n.t('common.show')}</span>
                  </Link>
                  <a
                    className="bt bt-danger"
                    onClick={onDelete}
                    href={`/api/projects/${projectId}/project_reports/${report.id}`}
                  >
                    <i className="symbol fa fa-trash-o" />
                    <span className="bt-txt">{I18n.t('apps.reports.remove')}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
