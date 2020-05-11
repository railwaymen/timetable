import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import translateErrors from '../../shared/translate_errors';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';
import SynchronizeReport from './synchronize_report';

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
        <i className={`fa ${iconClass} mr-2`} />
        {state}
      </span>
    );
  }

  function onDelete(e) {
    e.preventDefault();

    if (window.confirm(I18n.t('common.confirm'))) {
      Api.makeDeleteRequest({ url: e.currentTarget.href }).then((data) => {
        if (data.status === 204) {
          getReports();
        } else if (data.status === 422) {
          data.json().then((results) => {
            const errors = translateErrors('project_report', results.errors);
            alert(errors.base.join(', '));
          });
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
          <Link className="btn btn-secondary active" to={`/projects/${projectId}/reports`}>
            {I18n.t('common.reports')}
          </Link>
          <Link className="btn btn-secondary" to={`/projects/${projectId}/combined_reports`}>
            {I18n.t('common.combined_reports')}
          </Link>
        </div>
        <div className="text-right">
          <Link to={`/projects/${projectId}/new_report`} className="btn btn-success">
            <i className="fa fa-plus mr-2" />
            {I18n.t('apps.reports.new')}
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
                  {`${moment(report.starts_at).formatDate()} - ${moment(report.ends_at).formatDate()}`}
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
                  <SynchronizeReport url={`/api/projects/${projectId}/project_reports/${report.id}/synchronize`} />
                </td>
                <td className="report-actions text-right">
                  <div className="btn-group">
                    {report.generated && (
                      <a
                        className="btn btn-outline-secondary bt-download"
                        href={`/api/projects/${projectId}/project_reports/${report.id}/file`}
                      >
                        <i className="fa fa-file-pdf-o mr-2" />
                        {I18n.t('common.download')}
                      </a>
                    )}
                    <Link className="btn btn-outline-secondary" to={`/projects/${projectId}/edit_report/${report.id}`}>
                      <i className="fa fa-search mr-2" />
                      {I18n.t('common.show')}
                    </Link>
                    <a
                      className="btn btn-outline-danger"
                      onClick={onDelete}
                      href={`/api/projects/${projectId}/project_reports/${report.id}`}
                    >
                      <i className="fa fa-trash-o mr-2" />
                      {I18n.t('apps.reports.remove')}
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
