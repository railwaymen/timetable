import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class Navbar extends React.Component {
  render () {
    return (
      <div className="navbar">
        <div className="ui secondary menu">
          <NavLink className="item" to="/users">Users</NavLink>
          <NavLink className="item" to="/projects">Projects</NavLink>
          <NavLink className="item" to="/reports/work_times/by_projects">Reports</NavLink>
          <NavLink className="item" to="/accounting_periods">Accounting periods</NavLink>
          <div className="right menu">
            <div className="item"></div>
            <NavLink className="item" to="users/edit">Your Name</NavLink>
            <NavLink className="sign_out ui button" to="users/edit">Log out</NavLink>
          </div>
        </div>
      </div>
    )
  }
}

export default Navbar
