import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class Navbar extends React.Component {
  render () {
    return (
      <div className="navbar">
        <div className="ui secondary menu">
          { currentUser.admin &&
            <NavLink className="item" to="/users">Users</NavLink> }
          <NavLink className="item" to="/projects">Projects</NavLink>
          <NavLink className="item" to={currentUser.admin || currentUser.manager || currentUser.leader ? '/reports/work_times' : '/reports/work_times/by_users'}>Reports</NavLink>
          <NavLink className="item" to="/accounting_periods">Accounting periods</NavLink>
          <NavLink className="item" to="/timesheet">Timesheet</NavLink>
          <div className="right menu">
            <div className="item"></div>
            <NavLink className="item" to={`/users/edit/${currentUser.id}`}>{currentUser.first_name} {currentUser.last_name}</NavLink>
            <NavLink className="sign_out ui button" to="/users/sign_out" data-method="delete">Log out</NavLink>
          </div>
        </div>
      </div>
    )
  }
}

export default Navbar
