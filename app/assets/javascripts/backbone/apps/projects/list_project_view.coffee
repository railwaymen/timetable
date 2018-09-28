App.Projects.ListProjectView = Backbone.Marionette.ItemView.extend
  template: 'apps/projects/list_project'
  tagName: 'tr'
  className: 'row'

  ui:
    buttons: '.buttons'

  initialize: ->
    @listenTo App.vent, 'changedAdminState', @toggleAdminButtons

  toggleAdminButtons: ->
    @ui.buttons.toggle()

  onRender: ->
    @ui.buttons.toggle(App.currentUser.isAdmin() || @model.get('leader_id') == App.currentUser.id)
