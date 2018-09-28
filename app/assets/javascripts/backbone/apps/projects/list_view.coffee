App.Projects.ListView = Backbone.Marionette.CompositeView.extend
  template: 'apps/projects/list'
  childView: App.Projects.ListProjectView
  childViewContainer: 'tbody'

  events:
    'change #filter': 'filterProjects'

  templateHelpers: ->
    {
      params: @collection.params
    }

  initialize: ->
    @listenTo App.vent, 'changedAdminState', @toggleAdminButtons

  filterProjects: ->
    @collection.params.display = @$('#filter').val()
    @collection.fetch(data: @collection.params).done =>
      @render()
