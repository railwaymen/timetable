import React from 'react';
import moment from 'moment';

class ReportProjectTagRecord extends React.Component {
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

  render() {
    const { reportRows } = this.props;
    const overallData = reportRows[0];
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4>
            <span className="badge">{this.formattedDuration(overallData.project_duration)}</span>
            <i className="glyphicon glyphicon-tags" />
            {overallData.project_name}
          </h4>
        </div>
        <ul className="list-group">
          { reportRows.map((row, index) => (
            <li className="list-group-item record" key={index}> {/* eslint-disable-line */}
              <input type="button" disabled className={`tags ${row.tag}`} value={row.tag_label} />
              {`${Math.floor(row.duration * 10000 / row.project_duration) / 100}%`}
              <span className="badge">{this.formattedDuration(row.duration)}</span>
            </li>
          )) }
        </ul>
      </div>
    );
  }
}

export default ReportProjectTagRecord;
