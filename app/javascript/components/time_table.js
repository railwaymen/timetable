import React from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import '../models/currentUser';
import Navbar from './shared/navbar';

import Projects from './time_table/projects/projects';
import ProjectsProgress from './time_table/projects/projects_progress';
import ProjectsRanking from './time_table/projects/projects_ranking';
import ProjectWorkTimes from './time_table/projects/project_work_times';
import EditProject from './time_table/projects/edit_project';
import ExternalAuth from './time_table/users/external_auth';
import Users from './time_table/users/users';
import EditUser from './time_table/users/edit_user';
import Tags from './time_table/tags/tags';
import EditTag from './time_table/tags/edit_tag';
import ByProjects from './time_table/reports/by_projects';
import ByUsers from './time_table/reports/by_users';
import Periods from './time_table/accounting_periods/periods';
import EditPeriod from './time_table/accounting_periods/edit_period';
import Timesheet from './time_table/timesheet/timesheet';
import NewReport from './time_table/project_reports/new_report';
import EditReport from './time_table/project_reports/edit_report';
import ProjectReports from './time_table/project_reports/project_reports';
import CombinedReports from './time_table/combined_reports/combined_reports';
import CombinedReport from './time_table/combined_reports/combined_report';
import NewCombinedReport from './time_table/combined_reports/new_combined_report';
import Vacations from './time_table/vacations/vacations';
import Staff from './time_table/staff/staff';
import VacationPeriods from './time_table/vacation_periods/vacation_periods';
import EditVacationPeriod from './time_table/vacation_periods/edit_vacation_period';
import ProjectsDistribution from './time_table/projects_distribution/projects_distribution';
import RemoteWork from './time_table/remote_work/remote_work';
import HardwareList from './time_table/hardware/hardware_list';
import HardwareManagementList from './time_table/hardware_management/hardware_list';
import HardwareManagementItemEdit from './time_table/hardware_management/hardware_item';
import HardwareManagementItem from './time_table/hardware_management/hardware_item_show';
import Milestones from './time_table/milestones/milestones';
import EditMilestone from './time_table/milestones/edit_milestone';
import MilestoneEstimates from './time_table/milestones/milestone_estimates';
import MilestoneReports from './time_table/milestone_reports/milestone_reports';

class TimeTable extends React.Component {
  constructor(props) {
    super(props);

    I18n.locale = currentUser.lang;
  }

  render() {
    return (
      <BrowserRouter>
        <div className="app container-fluid">
          { window.location.pathname === '/' ? <Redirect to="/timesheet" /> : null }
          <Navbar />
          <div className="content">
            <Route path="/users" exact component={Users} />
            <Route path="/users/edit/:id" component={EditUser} />
            <Route path="/users/new" exact component={EditUser} />
            <Route path="/users/:id/external_authorization" component={ExternalAuth} />
            <Route path="/staff" exact component={Staff} />
            <Route path="/projects" exact component={Projects} />
            <Route path="/projects/progress" exact component={ProjectsProgress} />
            <Route path="/projects/ranking" exact component={ProjectsRanking} />
            <Route path="/projects/:id/work_times" component={ProjectWorkTimes} />
            <Route path="/projects/:id/edit" component={EditProject} />
            <Route path="/projects/:projectId/milestones" exact component={Milestones} />
            <Route path="/projects/:projectId/milestone_reports" exact component={MilestoneReports} />
            <Route path="/projects/:projectId/milestones/new" exact component={EditMilestone} />
            <Route path="/projects/:projectId/milestones/:id/edit" exact component={EditMilestone} />
            <Route path="/projects/:projectId/milestones/:id/estimates" exact component={MilestoneEstimates} />
            <Route path="/projects/:projectId/reports" component={ProjectReports} />
            <Route path="/projects/:projectId/new_report" component={NewReport} />
            <Route path="/projects/:projectId/edit_report/:reportId" component={EditReport} />
            <Route path="/projects/:projectId/combined_reports" exact component={CombinedReports} />
            <Route path="/projects/:projectId/combined_reports/:id" component={CombinedReport} />
            <Route path="/projects/:projectId/new_combined_report" component={NewCombinedReport} />
            <Route path="/projects/new" component={EditProject} />
            <Route path="/tags" exact component={Tags} />
            <Route path="/tags/new" exact component={EditTag} />
            <Route path="/tags/edit/:id" component={EditTag} />
            <Route path="/reports/work_times/by_projects" component={ByProjects} />
            <Route path="/reports/work_times/by_users" component={ByUsers} />
            <Route path="/accounting_periods" exact component={Periods} />
            <Route path="/accounting_periods/edit/:id" component={EditPeriod} />
            <Route path="/accounting_periods/new" component={EditPeriod} />
            <Route path="/vacation_periods" exact component={VacationPeriods} />
            <Route path="/vacation_periods/edit/:id" component={EditVacationPeriod} />
            <Route path="/timesheet" component={Timesheet} />
            <Route path="/vacations" exact component={Vacations} />
            <Route path="/remote_work" exact component={RemoteWork} />
            <Route path="/projects_distribution" component={ProjectsDistribution} />
            <Route path="/hardware" component={HardwareList} />

            <Route path="/hardware-devices/:id/edit" exact component={HardwareManagementItemEdit} />
            <Route path="/hardware-devices" exact component={HardwareManagementList} />
            <Route path="/hardware-devices/:id/show" exact component={HardwareManagementItem} />
            <Route path="/hardware-devices/new" component={HardwareManagementItemEdit} />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default TimeTable;
