import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import useFormHandler from '@hooks/use_form_handler';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';
import SummaryPopup from './summary_popup';

const simpleDateFormat = (date) => moment(date).format('YYYY/MM/DD');

export default function NewGroupReport(props) {
  const projectId = parseInt(props.match.params.projectId, 10);

  const [reports, setReports] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [gropuReport, setGropuReport, onChange] = useFormHandler({ name: '', report_ids: [] });

  function togglePopup() {
    setShowPopup(!showPopup);
  }

  function getReports() {
    Api.makeGetRequest({ url: `/api/projects/${projectId}/project_reports` })
      .then(({ data }) => setReports(data));
  }

  function selectReport(reportId) {
    const newrReportIds = _.xor(gropuReport.report_ids, [reportId]);
    setGropuReport({ ...gropuReport, report_ids: newrReportIds });
  }

  function selectedReports() {
    return reports.filter((report) => gropuReport.report_ids.includes(report.id));
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

  useEffect(() => {
    getReports();
  }, []);

  console.log('gropuReport', gropuReport);

  return (
    <div className="list-of-reports">
      <Helmet>
        <title>{I18n.t('common.reports')}</title>
      </Helmet>
      <p className="text-right">
        <button type="button" className="bt bt-main" onClick={togglePopup}>show popup</button>
      </p>
      <form className="row" onSubmit={(e) => e.preventDefault()}>
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
                    {`${simpleDateFormat(report.starts_at)}-${simpleDateFormat(report.ends_at)}`}
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
      </form>
      {showPopup && (
        <SummaryPopup closePopup={togglePopup} reports={selectedReports()} />
      )}
    </div>
  );
}
