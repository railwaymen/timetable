import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class User extends React.Component {
  getIconClass () {
    if (this.props.user.active) {
      return 'active';
    } else {
      return 'inactive';
    }
  }

  render () {
    const user = this.props.user;

    return (
      <tr>
        <td><div className={`circle ${this.getIconClass()}`}></div></td>
        <td>{user.last_name}</td>
        <td>{user.first_name}</td>
        <td>{user.email}</td>
        <td>{user.contract_id}</td>
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
    )
  }
}

export default User;
