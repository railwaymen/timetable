App.Projects.ProjectsView = Backbone.Marionette.ItemView.extend
  template: 'apps/projects/projects'
  sortUpIcon: 'glyphicon glyphicon-triangle-top'
  sortDnIcon: 'glyphicon glyphicon-triangle-bottom'

  initialize: ->
    @listenTo App.vent, 'changedAdminState', @toggleAdminButtons

  events:
    'click th': 'sortProjects'
    'change #active': 'filterProjects'
    'change #filter': 'filterRange'

  sortProjects: (e) ->
    @collection.sortProjects(e.toElement.id)

  templateHelpers: ->
    params: @collection.params
    collection: _.groupBy(@collection.toJSON(), 'name')

  filterProjects: ->
    @collection.params.active = @$('#active').val()
    @collection.fetch(data: @collection.params).done =>
      @render()

  filterRange: ->
    @collection.params.range = @$('#filter').val()
    @collection.fetch(data: @collection.params).done =>
      @render()

  onRender: ->
    icon = if @collection.sortDirection is 1 then @sortUpIcon else @sortDnIcon
    @$('th i').removeClass(@sortUpIcon + ' ' + @sortDnIcon)
    @$('#' + @collection.sortAttribute + ' i').addClass(icon)
