import React from 'react';
import PropTypes from 'prop-types';
import { formattedDuration, countDurationPercentage } from '../../shared/helpers';

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
            <input type="button" disabled className={`tags selected ${row.tag}`} value={I18n.t(`apps.tag.${row.tag}`).toUpperCase()} />
            {countDurationPercentage(row.duration, row.project_duration)}
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
      duration: PropTypes.number.isRequired,
      project_duration: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default ReportProjectTagRecord;
