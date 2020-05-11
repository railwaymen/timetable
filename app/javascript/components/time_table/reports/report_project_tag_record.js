import React from 'react';
import PropTypes from 'prop-types';
import { formattedDuration, countDurationPercentage } from '../../shared/helpers';

const ReportProjectTagRecord = ({ reportRows }) => {
  const overallData = reportRows[0];
  return (
    <div className="card p-0 w-100">
      <div className="card-header">
        <h4 className="row mx-0">
          <i className="fa fa-tags mr-2" />
          {overallData.project_name}
          <span className="ml-auto badge badge-dark">{formattedDuration(overallData.project_duration)}</span>
        </h4>
      </div>
      <div className="card-body">
        <ul className="list-group">
          { reportRows.map((row, index) => (
            <li className="list-group-item record align-items-baseline" key={index}> {/* eslint-disable-line */}
              <input type="button" disabled className={`tags selected ${row.tag}`} value={I18n.t(`apps.tag.${row.tag}`).toUpperCase()} />
              {countDurationPercentage(row.duration, row.project_duration)}
              <span className="badge badge-dark ml-auto">{formattedDuration(row.duration)}</span>
            </li>
          )) }
        </ul>
      </div>
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
