import React from 'react';
import moment from 'moment';

class ReportProjectRecord extends React.Component {
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
              {overallData.project_name}
              <a href={`/reports/project.csv?from=${from}&to=${to}&id=${overallData.project_id}`}><i className="calendar icon" /></a>
            </h4>
            <span className="badge">{this.formattedDuration(overallData.project_duration)}</span>
          </div>
          <ul className="list-group">
            { reportRows.map((row, index) => (
              <li className="list-group-item" key={index}> {/* eslint-disable-line */}
                <a href={`/timesheet?project_id=${row.project_id}&user_id=${row.user_id}&from=${from}&to=${to}`} onClick={this.onRedirect}>
                  {row.user_name}
                </a>
                (
                {Math.floor(row.duration * 10000 / row.project_duration) / 100}
%)
                <span className="badge">{this.formattedDuration(row.duration)}</span>
              </li>
            )) }
          </ul>
        </div>
      </div>
    );
  }
}

export default ReportProjectRecord;
