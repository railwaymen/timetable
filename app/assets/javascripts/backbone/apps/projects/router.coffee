ProjectsController = Marionette.Controller.extend
  initialize: ->
    @projects = new App.Entities.Projects()

  index: ->
    @projects.fetch().done =>
      view = new App.Projects.ProjectsView(collection: @projects)
      App.rootView.getRegion('content').show(view)

  list: ->
    projects = new App.Entities.ProjectsList()
    projects.fetch().done =>
      view = new App.Projects.ListView(collection: projects)
      App.rootView.getRegion('content').show(view)

  new: ->
    users = new App.Entities.Users()
    users.fetch(data: { filter: 'active' }).done =>
      project = new App.Entities.Project({}, collection: @projects)
      view = new App.Projects.EditProjectView(model: project, users: users)
      App.rootView.getRegion('content').show(view)

  edit: (id) ->
    users = new App.Entities.Users()
    project = @projects.get(id) || new App.Entities.Project(id: id, {collection: @projects})
    $.when(users.fetch(data: { filter: 'active' }), project.fetch()).done =>
      view = new App.Projects.EditProjectView(model: project, users: users)
      App.rootView.getRegion('content').show(view)

Router = Marionette.AppRouter.extend
  onRoute: -> App.vent.trigger('route', 'projects')
  appRoutes: {
    'projects/list': 'list'
    'projects/new': 'new'
    'projects/edit/:id': 'edit'
    'projects/': 'index'
    '*actions': 'index'
  }

new Router(controller: new ProjectsController())
