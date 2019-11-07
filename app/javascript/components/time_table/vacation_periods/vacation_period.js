import React from 'react';
import { NavLink } from 'react-router-dom';
import { preserveLines } from '../../shared/helpers';

const VacationPeriod = (props) => {
  const { period, userName } = props;
  return (
    <tr>
      <td>{userName}</td>
      <td>{period.starts_at}</td>
      <td>{period.ends_at}</td>
      <td>{period.vacation_days}</td>
      <td className="text-left">{preserveLines(period.note || '')}</td>
      <td className="nowrap text-left">
        { currentUser.admin ? (
          <React.Fragment>
            <NavLink to={`/vacation_periods/edit/${period.id}?user_id=${period.user_id}`} className="bt bt-second edit">
              <i className="symbol fa fa-pencil" />
              <span className="bt-txt">{I18n.t('common.edit')}</span>
            </NavLink>
          </React.Fragment>
        ) : null }
      </td>
    </tr>
  );
};

export default VacationPeriod;
