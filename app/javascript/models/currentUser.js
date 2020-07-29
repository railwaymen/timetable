// currentUser is a global variable provided by rails view

Object.assign(window.currentUser, {
  isLeaderOf({ id, leader_id }) {
    return this.id === leader_id || this.projects.includes(id);
  },
  canManageProject(project) {
    return this.isSuperUser() || this.isLeaderOf(project);
  },
  isSuperUser() {
    return this.admin || this.manager || this.staff_manager;
  },
  isManager() {
    return this.admin || this.manager;
  },
  isManagerOrLeader() {
    return this.admin || this.manager || this.is_leader;
  },
  isHardwareManager() {
    return this.admin || this.hardware_manager;
  },
  isStaffManager() {
    return this.admin || this.staff_manager;
  },
  fullName() {
    return `${this.first_name} ${this.last_name}`;
  },
  canManageStaff() {
    return this.isSuperUser() || this.is_leader;
  },
});
