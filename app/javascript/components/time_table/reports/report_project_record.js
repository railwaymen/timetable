import React from 'react';
import { formattedDuration, countDurationPercentage } from '../../shared/helpers';

class ReportProjectRecord extends React.Component {
  constructor(props) {
    super(props);

    this.onRedirect = this.onRedirect.bind(this);
  }

  onRedirect(e) {
    e.preventDefault();
    this.props.redirectTo(e.target.href);
  }

  render() {
    const { reportRows, from, to } = this.props;
    const overallData = reportRows[0];
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4>
            <span className="badge">{formattedDuration(overallData.project_duration)}</span>
            {overallData.project_name}
            <a href={`/reports/project.csv?from=${from}&to=${to}&id=${overallData.project_id}`}><i className="calendar icon" /></a>
          </h4>
        </div>
        <ul className="list-group">
          { reportRows.map((row, index) => (
            <li className="list-group-item record" key={index}> {/* eslint-disable-line */}
              <a href={`/timesheet?project_id=${row.project_id}&user_id=${row.user_id}&from=${from}&to=${to}`} onClick={this.onRedirect}>
                {row.user_name}
              </a>
              (
              {countDurationPercentage(row.duration, row.project_duration)}
              )
              <span className="badge">{formattedDuration(row.duration)}</span>
            </li>
          )) }
        </ul>
      </div>
    );
  }
}

export default ReportProjectRecord;
