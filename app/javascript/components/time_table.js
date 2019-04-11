import React from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import Navbar from './shared/navbar.js';

import Projects from './time_table/projects/projects.js';
import ProjectsList from './time_table/projects/projects_list.js';
import ProjectWorkTimes from './time_table/projects/project_work_times';
import EditProject from './time_table/projects/edit_project.js';
import ExternalAuth from './time_table/projects/external_auth';
import Users from './time_table/users/users.js';
import EditUser from './time_table/users/edit_user.js';
import ByProjects from './time_table/reports/by_projects.js';
import ByUsers from './time_table/reports/by_users.js';
import Periods from './time_table/accounting_periods/periods.js';
import EditPeriod from './time_table/accounting_periods/edit_period.js';
import Timesheet from './time_table/timesheet/timesheet.js';

class TimeTable extends React.Component {
  constructor (props) {
    super(props);

    I18n.locale = currentUser.lang;
  }

  render () {
    return (
      <BrowserRouter>
        <div className="app container">
          { window.location.pathname === '/' ? <Redirect to="/timesheet" /> : null }
          <Navbar />
          <div className="content">
            <Route path='/users' exact component={Users} />
            <Route path='/users/edit/:id' component={EditUser} />
            <Route path='/users/new' exact component={EditUser} />
            <Route path='/projects' exact component={Projects} />
            <Route path='/projects/list' exact component={ProjectsList} />
            <Route path='/projects/:id/work_times' component={ProjectWorkTimes} />
            <Route path='/projects/:id/edit' component={EditProject} />
            <Route path='/projects/:id/external_authorization' component={ExternalAuth} />
            <Route path='/projects/new' component={EditProject} />
            <Route path='/reports/work_times/by_projects' component={ByProjects} />
            <Route path='/reports/work_times/by_users' component={ByUsers} />
            <Route path='/accounting_periods' exact component={Periods} />
            <Route path='/accounting_periods/edit/:id' component={EditPeriod} />
            <Route path='/accounting_periods/new' component={EditPeriod} />
            <Route path='/timesheet' component={Timesheet} />
          </div>
        </div>
      </BrowserRouter>
    )
  }
}

export default TimeTable;
