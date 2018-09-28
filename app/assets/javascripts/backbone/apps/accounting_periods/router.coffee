UsersController = Marionette.Controller.extend
  initialize: ->
    @accountingPeriods = new App.Entities.AccountingPeriods()
    @users = new App.Entities.Users()

  index: (params = {}) ->
    user_id = if params.user_id then params.user_id else App.currentUser.id
    @accountingPeriods.params.user_id = user_id
    @accountingPeriods.params.currentPage = @accountingPeriods.state.currentPage

    if App.currentUser.isAdmin()
      $.when(@users.fetch(), @accountingPeriods.fetch(reset: true)).done =>
        user = @users.get(user_id)
        view = new App.AccountingPeriods.PeriodsView(collection: @accountingPeriods, users: @users, user: user)
        App.rootView.getRegion('content').show(view)
    else
      $.when(@accountingPeriods.fetch(reset: true)).done =>
        user = App.currentUser
        view = new App.AccountingPeriods.PeriodsView(collection: @accountingPeriods, user: user)
        App.rootView.getRegion('content').show(view)

  new: (params = {}) ->
    user_id = if params.user_id then params.user_id
    @users.fetch(data: { filter: 'active' }).done =>
      accountingPeriod = new App.Entities.AccountingPeriod()
      accountingPeriod.userId = user_id
      view = new App.AccountingPeriods.EditAccountingPeriodView(model: accountingPeriod, users: @users)
      App.rootView.getRegion('content').show(view)

  edit: (id, params = {}) ->
    user_id = if params.user_id then params.user_id
    page = if params.page then params.page
    $.when(@accountingPeriods.getPage(parseInt(page)), @users.fetch()).done =>
      accountingPeriod = @accountingPeriods.get(id)
      accountingPeriod.userId = user_id
      view = new App.AccountingPeriods.EditAccountingPeriodView(model: accountingPeriod, users: @users)
      App.rootView.getRegion('content').show(view)

Router = Marionette.AppRouter.extend
  onRoute: -> App.vent.trigger('route', 'accounting_periods')
  appRoutes: {
    "accounting_periods": "index"
    "accounting_periods/new": "new"
    "accounting_periods/edit/:id": "edit"
  }

new Router(controller: new UsersController())
