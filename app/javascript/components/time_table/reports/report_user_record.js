import React from 'react';
import { formattedDuration, countDurationPercentage } from '../../shared/helpers';

class ReportUserRecord extends React.Component {
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
      <div className="col-12 col-md-4">
        <div className="card panel-default">
          <div className="panel-heading">
            <h4>
              <i className="glyphicon glyphicon-user" />
              <a href={`/timesheet?user_id=${overallData.user_id}&from=${from}&to=${to}`} onClick={this.onRedirect}>{overallData.user_name}</a>
              <a href={`/reports/project.csv?from=${from}&to=${to}&user_id=${overallData.user_id}`}><i className="calendar icon" /></a>
              <span className="badge">{formattedDuration(overallData.user_work_time)}</span>
            </h4>
          </div>
          <ul className="list-group">
            { reportRows.map((row) => (
              <li className="list-group-item" key={row.project_id}>
                <a href={`/timesheet?project_id=${row.project_id}&user_id=${row.user_id}&from=${from}&to=${to}`} onClick={this.onRedirect}>
                  {row.project_name}
                </a>
                (
                {countDurationPercentage(row.time_worked, row.user_work_time)}
                )
                <span className="badge">{formattedDuration(row.time_worked)}</span>
              </li>
            )) }
          </ul>
        </div>
      </div>
    );
  }
}

export default ReportUserRecord;
