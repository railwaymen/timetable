import React from 'react';
import PropTypes from 'prop-types';
import { formattedDuration } from '../../shared/helpers';

const ReportProjectTagRecord = ({ reportRows }) => {
  const overallData = reportRows[0];
  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h4>
          <span className="badge">{formattedDuration(overallData.project_duration)}</span>
          <i className="glyphicon glyphicon-tags" />
          {overallData.project_name}
        </h4>
      </div>
      <ul className="list-group">
        { reportRows.map((row, index) => (
          <li className="list-group-item record" key={index}> {/* eslint-disable-line */}
            <input type="button" disabled className={`tags ${row.tag}`} value={row.tag_label} />
            {`${Math.floor(row.duration * 10000 / row.project_duration) / 100}%`}
            <span className="badge">{formattedDuration(row.duration)}</span>
          </li>
        )) }
      </ul>
    </div>
  );
};

ReportProjectTagRecord.propTypes = {
  reportRows: PropTypes.arrayOf(
    PropTypes.shape({
      tag: PropTypes.string.isRequired,
      tag_label: PropTypes.string.isRequired,
      duration: PropTypes.number.isRequired,
      project_duration: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default ReportProjectTagRecord;
