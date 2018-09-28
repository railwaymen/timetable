UsersController = Marionette.Controller.extend
  initialize: ->
    @users = new App.Entities.Users()

  index: ->
    @users.fetch(data: { filter: 'active' }).done =>
      view = new App.Users.UsersView(collection: @users)
      App.rootView.getRegion('content').show(view)

  show: (id) ->
    user = @users.get(id) || new App.Entities.User(id: id, {collection: @users})
    user.fetch().done =>
      view = new App.Users.UserDetailsView(model: user)
      App.rootView.getRegion('content').show(view)

  new: ->
    user = new App.Entities.User({}, collection: @users)
    view = new App.Users.EditUserView(model: user)
    App.rootView.getRegion('content').show(view)

  edit: (id) ->
    user = @users.get(id) || new App.Entities.User(id: id, {collection: @users})
    user.fetch().done =>
      view = new App.Users.EditUserView(model: user)
      App.rootView.getRegion('content').show(view)

Router = Marionette.AppRouter.extend
  onRoute: -> App.vent.trigger('route', 'users')
  appRoutes: {
    "users": "index"
    "users/new": "new"
    "users/edit/:id": "edit"
    "users/:id": "show"
  }

new Router(controller: new UsersController())
