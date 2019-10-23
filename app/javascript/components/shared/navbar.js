import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Api from './api';

const onLogout = () => {
  Api.makeDeleteRequest({ url: '/users/sign_out' })
    .then(() => {
      window.location.href = '/';
    });
};


const Navbar = () => (
  <div className="navbar">
    <div className="ui secondary menu">
      { currentUser.admin
            && <NavLink className="item" to="/users">{I18n.t('common.people')}</NavLink> }
      { currentUser.canManageStaff()
            && <NavLink className="item" to="/staff">{I18n.t('common.staff')}</NavLink>}
      <NavLink className="item" to="/projects">{I18n.t('common.projects')}</NavLink>
      <NavLink className="item" to={(currentUser.isSuperUser() || currentUser.is_leader) ? '/reports/work_times/by_projects' : '/reports/work_times/by_users'}>{I18n.t('common.reports')}</NavLink>
      <NavLink className="item" to="/accounting_periods">{I18n.t('common.accounting_periods')}</NavLink>
      <NavLink className="item" to="/vacation_periods">{I18n.t('common.vacation_periods')}</NavLink>
      <NavLink className="item" to="/timesheet">{I18n.t('common.timesheet')}</NavLink>
      <NavLink className="item" to="/vacations">{I18n.t('common.vacations')}</NavLink>
      <div className="right menu">
        <div className="item" />
        <NavLink className="item" to={`/users/edit/${currentUser.id}`}>
          {currentUser.fullName()}
        </NavLink>
        <a onClick={onLogout} className="sign_out ui button" to="/users/sign_out">{I18n.t('common.sign_out')}</a>
      </div>
    </div>
  </div>
);

export default Navbar;
