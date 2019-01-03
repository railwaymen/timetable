import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import * as Api from './api.js';

class Navbar extends React.Component {
  onLogout () {
    Api.makeDeleteRequest({ url: '/users/sign_out' })
       .then(() => {
         window.location.href = '/'
       })
  }

  render () {
    return (
      <div className="navbar">
        <div className="ui secondary menu">
          { currentUser.admin &&
            <NavLink className="item" to="/users">{I18n.t('common.people')}</NavLink> }
          <NavLink className="item" to="/projects">{I18n.t('common.projects')}</NavLink>
          <NavLink className="item" to={currentUser.admin || currentUser.manager || currentUser.leader ? '/reports/work_times/by_projects' : '/reports/work_times/by_users'}>{I18n.t('common.reports')}</NavLink>
          <NavLink className="item" to="/accounting_periods">{I18n.t('common.accounting_periods')}</NavLink>
          <NavLink className="item" to="/timesheet">{I18n.t('common.timesheet')}</NavLink>
          <div className="right menu">
            <div className="item"></div>
            <NavLink className="item" to={`/users/edit/${currentUser.id}`}>{currentUser.last_name} {currentUser.first_name}</NavLink>
            <a onClick={this.onLogout} className="sign_out ui button" to="/users/sign_out">{I18n.t('common.sign_out')}</a>
          </div>
        </div>
      </div>
    )
  }
}

export default Navbar;
