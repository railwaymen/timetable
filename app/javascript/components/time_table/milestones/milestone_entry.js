import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { formattedDuration } from '../../shared/helpers';

function MilestoneEntry(props) {
  const { milestone } = props;
  const estimatedValue = milestone.total_estimate ? milestone.total_estimate : 1;
  const percentage = !milestone.work_times_duration ? 0 : (milestone.work_times_duration / estimatedValue) * 100;

  return (
    <tr>
      <td>
        {milestone.name}
      </td>
      <td>
        {milestone.starts_on && moment(milestone.starts_on).formatDate()}
      </td>
      <td>
        {milestone.ends_on && moment(milestone.ends_on).formatDate()}
        {milestone.date_overlaps && (<i className="fa fa-exclamation-triangle text-warning ml-1" title={I18n.t('apps.milestones.date_overlaps')} />)}
      </td>
      <td>
        {(milestone.closed && <i className="fa fa-check-circle" title={I18n.t('apps.milestones.milestone_closed')} />)}
        {(milestone.current && <i className="fa fa-hourglass-half" title={I18n.t('apps.milestone_reports.current_milestone')} />)}
      </td>
      <td>
        <div className="row">
          <div className="col-2">{formattedDuration(milestone.work_times_duration)}</div>
          <div className="col-8">
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          <div className="col-2">{formattedDuration(milestone.total_estimate)}</div>
        </div>
      </td>
      <td>
        <div className="btn-group">
          <NavLink to={`/projects/${milestone.project_id}/milestones/${milestone.id}/estimates`} className="btn btn-secondary">
            <i className="fa fa-clock-o" />
          </NavLink>
          <NavLink to={`/projects/${milestone.project_id}/milestones/${milestone.id}/edit`} className="btn btn-secondary">
            <i className="fa fa-pencil" />
          </NavLink>
        </div>
      </td>
    </tr>
  );
}

MilestoneEntry.propTypes = {
  milestone: PropTypes.shape({
    name: PropTypes.string,
    starts_at: PropTypes.string,
    ends_at: PropTypes.string,
    duration: PropTypes.number,
    project_id: PropTypes.number,
    note: PropTypes.string,
  }),
};

export default MilestoneEntry;
