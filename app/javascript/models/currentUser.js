// currentUser is a global variable provided by rails view

window.currentUser.isLeaderOf = function({ id, leader_id }) {
  return this.id === leader_id || this.projects.includes(id);
};

window.currentUser.canManageProject = function (project) {
  return this.admin || this.manager || this.isLeaderOf(project);
}

window.currentUser.isSuperUser = function () {
  return this.admin || this.manager || this.is_leader;
}

