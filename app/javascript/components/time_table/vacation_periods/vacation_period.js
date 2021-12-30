import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { preserveLines } from '../../shared/helpers';

function VacationPeriod(props) {
  const { period, userName } = props;

  return (
    <tr>
      <td>{userName}</td>
      <td>{period.starts_at}</td>
      <td>{period.ends_at}</td>
      <td>{period.vacation_days}</td>
      <td className="text-left">{preserveLines(period.note || '')}</td>
      { currentUser.admin && (
        <td className="nowrap text-left">
          <NavLink
            to={`/vacation_periods/edit/${period.id}?user_id=${period.user_id}`}
            className="btn btn-outline-secondary edit"
          >
            <i className="fa fa-pencil mr-2" />
            {I18n.t('common.edit')}
          </NavLink>
        </td>
      )}
    </tr>
  );
}

VacationPeriod.propTypes = {
  period: PropTypes.object.isRequired,
  userName: PropTypes.string.isRequired,
};

export default VacationPeriod;
