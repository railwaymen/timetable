App.Entities.ProjectsList = Backbone.Collection.extend
  model: App.Entities.Project
  url: ->
    '/api/projects/list'

  initialize: ->
    @params = {}
