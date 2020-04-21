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
      <td>
        <div className="ui buttons">
          <NavLink className="ui button icon basic grey" to={`/timesheet?user_id=${user.id}`}>
            <i className="icon calendar" />
          </NavLink>
          <NavLink className="ui button icon basic grey" to={`/accounting_periods?user_id=${user.id}`}>
            <i className="icon folder outline" />
          </NavLink>
          <NavLink className="ui button icon basic blue" to={`/users/edit/${user.id}`}>
            <i className="icon pencil" />
          </NavLink>
        </div>
      </td>
    </tr>
  );
}

export default User;
