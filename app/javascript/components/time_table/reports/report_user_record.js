import React from 'react';
import moment from 'moment';

class ReportUserRecord extends React.Component {
  constructor(props) {
    super(props);

    this.onRedirect = this.onRedirect.bind(this);
  }

  formattedDuration(value) {
    if (!value || parseInt(value, 10) === 0) {
      return '00:00';
    }
    const time = moment.duration(value, 'seconds').asMinutes();

    let hours = Math.floor(time / 60);
    let minutes = time % 60;

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  onRedirect(e) {
    e.preventDefault();
    this.props.redirectTo(e.target.href);
  }

  render() {
    const { reportRows, from, to } = this.props;
    const overallData = reportRows[0];

    return (
      <div className="col-md-6">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h4>
              <i className="glyphicon glyphicon-user" />
              <a href={`/timesheet?user_id=${overallData.user_id}&from=${from}&to=${to}`} onClick={this.onRedirect}>{overallData.user_name}</a>
              <a href={`/reports/project.csv?from=${from}&to=${to}&user_id=${overallData.user_id}`}><i className="calendar icon" /></a>
            </h4>
            <span className="badge">{this.formattedDuration(overallData.user_work_time)}</span>
          </div>
          <ul className="list-group">
            { reportRows.map(row => (
              <li className="list-group-item" key={row.project_id}>
                <a href={`/timesheet?project_id=${row.project_id}&user_id=${row.user_id}&from=${from}&to=${to}`} onClick={this.onRedirect}>
                  {row.project_name}
                </a>
                (
                {Math.floor(row.time_worked * 10000 / row.user_work_time) / 100}
%)
                <span className="badge">{this.formattedDuration(row.time_worked)}</span>
              </li>
            )) }
          </ul>
        </div>
      </div>
    );
  }
}

export default ReportUserRecord;
