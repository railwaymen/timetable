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
    <div className="panel panel-default">
      <div className="panel-heading">
        <h4>
          <span className="badge">{formattedDuration(overallData.project_duration)}</span>
          {overallData.project_name}
          <a href={`/reports/project.csv?from=${from}&to=${to}&id=${overallData.project_id}`}>
            <i className="calendar icon" />
          </a>
        </h4>
      </div>
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
  );
}

export default ReportProjectRecord;
