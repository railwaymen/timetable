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
        <div className="card p-0 w-100">
          <div className="card-header">
            <h4 className="row align-items-baseline mx-0">
              <i className="fa fa-user" />
              <a
                className="mx-2"
                href={`/timesheet?user_id=${overallData.user_id}&from=${from}&to=${to}`}
                onClick={this.onRedirect}
              >
                {overallData.user_name}
              </a>
              {currentUser.isManagerOrLeader() && (
                <a href={`/reports/project.csv?from=${from}&to=${to}&user_id=${overallData.user_id}`}><i className="fa fa-calendar" /></a>
              )}
              <span className="ml-auto badge badge-dark">{formattedDuration(overallData.user_work_time)}</span>
            </h4>
          </div>
          <div className="card-body">
            <ul className="list-group">
              { reportRows.map((row) => (
                <li className="list-group-item" key={row.project_id}>
                  <a href={`/timesheet?project_id=${row.project_id}&user_id=${row.user_id}&from=${from}&to=${to}`} onClick={this.onRedirect}>
                    {row.project_name}
                  </a>
                  (
                  <span className="ml-2">{countDurationPercentage(row.time_worked, row.user_work_time)}</span>
                  )
                  <span className="badge badge-dark ml-auto">{formattedDuration(row.time_worked)}</span>
                </li>
              )) }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default ReportUserRecord;
