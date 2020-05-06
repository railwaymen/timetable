import React from 'react';
import { formattedDuration, countDurationPercentage } from '../../shared/helpers';

function ReportProjectRecord(props) {
  function onRedirect(e) {
    const { redirectTo } = props;

    e.preventDefault();
    redirectTo(e.target.href);
  }

  const { reportRows, from, to } = props;
  const overallData = reportRows[0];

  return (
    <div className="card p-0 w-100">
      <div className="card-header">
        <h4 className="row mx-0">
          {overallData.project_name}
          <a className="mx-2" href={`/reports/project.csv?from=${from}&to=${to}&id=${overallData.project_id}`}>
            <i className="fa fa-calendar" />
          </a>
          <span className="ml-auto badge badge-dark">{formattedDuration(overallData.project_duration)}</span>
        </h4>
      </div>
      <div className="card-body">
        <ul className="list-group">
          {reportRows.map((row) => (
            <li className="list-group-item record" key={row.user_id}>
              <a
                href={`/timesheet?project_id=${row.project_id}&user_id=${row.user_id}&from=${from}&to=${to}`}
                onClick={onRedirect}
              >
                {row.user_name}
              </a>
              (
              {countDurationPercentage(row.duration, row.project_duration)}
              )
              <span className="badge badge-dark ml-auto">{formattedDuration(row.duration)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ReportProjectRecord;
