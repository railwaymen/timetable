// currentUser is a global variable provided by rails view

window.currentUser.isLeaderOf = function isLeaderOf({ id, leader_id }) {
  return this.id === leader_id || this.projects.includes(id);
};

window.currentUser.canManageProject = function canManageProject(project) {
  return this.isSuperUser() || this.isLeaderOf(project);
};

window.currentUser.isSuperUser = function isSuperUser() {
  return this.admin || this.manager;
};

window.currentUser.fullName = function fullName() {
  return `${this.first_name} ${this.last_name}`;
};
