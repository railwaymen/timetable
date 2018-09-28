App.Projects.ProjectView = Backbone.Marionette.ItemView.extend
  template: 'apps/projects/project'
  tagName: 'li'
  className: 'row'

  templateHelpers: ->
    {
      platformIconClasses:
        ruby: 'diamond'
        ios: 'apple'
        android: 'android'
    }

  initialize: ->
    @listenTo App.vent, 'changedAdminState', @toggleAdminButtons

  toggleAdminButtons: ->
    @ui.edit.toggle()

  onRender: ->
    @ui.edit.toggle(App.currentUser.isAdmin())
