import React from 'react';
import { NavLink } from 'react-router-dom';

function User(props) {
  function getIconClass() {
    return props.user.active ? 'active' : 'inactive';
  }

  const { user } = props;

  return (
    <tr>
      <td><div className={`circle ${getIconClass()}`} /></td>
      <td>{user.last_name}</td>
      <td>{user.first_name}</td>
      <td>{user.email}</td>
      <td>{user.contract_name}</td>
      <td>{user.phone}</td>
      <td>{I18n.t(user.department, { scope: 'apps.department' })}</td>
      <td>
        <div className="btn-group">
          <NavLink className="btn btn-outline-secondary" to={`/timesheet?user_id=${user.id}`}>
            <i className="fa fa-calendar" />
          </NavLink>
          <NavLink className="btn btn-outline-secondary" to={`/accounting_periods?user_id=${user.id}`}>
            <i className="fa fa-folder-open-o" />
          </NavLink>
          <NavLink className="btn btn-outline-primary" to={`/users/edit/${user.id}`}>
            <i className="fa fa-pencil" />
          </NavLink>
        </div>
      </td>
    </tr>
  );
}

export default User;
