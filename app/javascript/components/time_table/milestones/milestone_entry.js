import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { formattedDuration } from '../../shared/helpers';

function MilestoneEntry(props) {
  const { milestone } = props;

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
      </td>
      <td>
        {(milestone.closed && <i className="fa fa-check-circle" />)}
        {(milestone.current && <i className="fa fa-hourglass-half" />)}
      </td>
      <td>
        {formattedDuration(milestone.total_estimate)}
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
