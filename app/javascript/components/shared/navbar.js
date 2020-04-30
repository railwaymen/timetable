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
  <nav className="navbar navbar-expand-lg navbar-light bg-transparent mb-3 px-0 flex-nowrap align-items-start">
    <button
      className="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon" />
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav">
        { currentUser.isAdminOrManager() && (
          <li className="nav-pills">
            <NavLink className="nav-link" to="/users">{I18n.t('common.people')}</NavLink>
          </li>
        )}
        { currentUser.canManageStaff() && (
          <li className="nav-pills">
            <NavLink className="nav-link" to="/staff">{I18n.t('common.staff')}</NavLink>
          </li>
        )}
        <li className="nav-pills">
          <NavLink className="nav-link" to="/projects">{I18n.t('common.projects')}</NavLink>
        </li>
        <li className="nav-pills">
          <NavLink
            className="nav-link"
            to={(currentUser.isSuperUser() || currentUser.is_leader) ? '/reports/work_times/by_projects' : '/reports/work_times/by_users'}
          >
            {I18n.t('common.reports')}
          </NavLink>
        </li>
        { currentUser.isAdminOrManager()
          && (
            <li className="nav-pills">
              <NavLink className="nav-link" to="/projects_distribution">{I18n.t('common.projects_distribution')}</NavLink>
            </li>
          )}
        <li className="nav-pills">
          <NavLink className="nav-link" to="/accounting_periods">{I18n.t('common.accounting_periods')}</NavLink>
        </li>
        <li className="nav-pills">
          <NavLink className="nav-link" to="/vacation_periods">{I18n.t('common.vacation_periods')}</NavLink>
        </li>
        <li className="nav-pills">
          <NavLink className="nav-link" to="/timesheet">{I18n.t('common.timesheet')}</NavLink>
        </li>
        <li className="nav-pills">
          <NavLink className="nav-link" to="/vacations">{I18n.t('common.vacations')}</NavLink>
        </li>
        <li className="nav-pills">
          <NavLink className="nav-link" to="/remote_work">{I18n.t('common.remote_work')}</NavLink>
        </li>
        { currentUser.admin && (
          <li className="nav-pills">
            <NavLink className="nav-link" to="/birthday_templates">{I18n.t('common.birthday_templates')}</NavLink>
          </li>
        )}
      </ul>
    </div>
    <ul className="navbar-nav user-nav ml-auto">
      <li className="nav-item">
        <NavLink
          className="nav-link"
          to="/hardware"
        >
          {I18n.t('common.hardware')}
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to={`/users/edit/${currentUser.id}`}>
          {currentUser.fullName()}
        </NavLink>
      </li>
      <li className="nav-item ml-2">
        <a onClick={onLogout} className="sign_out ui button" to="/users/sign_out">{I18n.t('common.sign_out')}</a>
      </li>
    </ul>


    {/* <div className="ui secondary menu">
      { currentUser.admin && (
        <NavLink className="item" to="/users">{I18n.t('common.people')}</NavLink>
      )}
      {currentUser.canManageStaff() && (
        <NavLink className="item" to="/staff">{I18n.t('common.staff')}</NavLink>
      )}
      <NavLink className="item" to="/projects">{I18n.t('common.projects')}</NavLink>
      <NavLink className="item" to={(currentUser.isSuperUser() || currentUser.is_leader) ? '/reports/work_times/by_projects' : '/reports/work_times/by_users'}>
        {I18n.t('common.reports')}
      </NavLink>
      { currentUser.isAdminOrManager()
            && <NavLink className="item" to="/projects_distribution">{I18n.t('common.projects_distribution')}</NavLink>}
      <NavLink className="item" to="/accounting_periods">{I18n.t('common.accounting_periods')}</NavLink>
      <NavLink className="item" to="/vacation_periods">{I18n.t('common.vacation_periods')}</NavLink>
      <NavLink className="item" to="/timesheet">{I18n.t('common.timesheet')}</NavLink>
      <NavLink className="item" to="/vacations">{I18n.t('common.vacations')}</NavLink>

      <NavLink className="item" to="/remote_work">{I18n.t('common.remote_work')}</NavLink>
      { currentUser.admin && (
        <NavLink className="item" to="/birthday_templates">{I18n.t('common.birthday_templates')}</NavLink>
      )}
    </div> */}
  </nav>
);

export default Navbar;
