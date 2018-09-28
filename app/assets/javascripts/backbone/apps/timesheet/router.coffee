Timesheetv2Controller = Marionette.Controller.extend
  initialize: ->
    @timeEntries = new App.Entities.TimeEntriesCollection()
    @projects = new App.Entities.Projects()
    @users = new App.Entities.Users()
    @projects.simple = true

  index: (params = {}) ->
    dateFrom = if params.from then moment(params.from) else moment().startOf('month')
    dateTo = if params.to then moment(params.to) else moment().endOf('month')

    window.currentDate = dateFrom

    @timeEntries.params = {}
    @timeEntries.params.from = dateFrom.format()
    @timeEntries.params.to = dateTo.format()
    @timeEntries.params.user_id = params.user_id
    @timeEntries.params.project_id = params.project_id

    user_id = @timeEntries.params.user_id || App.currentUser.id
    date = dateFrom.format('YYYY-MM-DD')
    $.getJSON("/api/accounting_periods/matching_fulltime.json?user_id=#{user_id}&date=#{date}", (response) =>
      @timeEntries.fullTime = response.period?.full_time
      @timeEntries.shouldWorked = response.should_worked
      @timeEntries.periodDuration = response.period?.duration
    )

    fetchCollections = [@projects, @timeEntries]
    fetchCollections.push(@users) if params.user_id

    $.when.apply($, _.invoke(fetchCollections, 'fetch', {silent: true})).done =>
      window.projects = @projects
      window.timeEntries = @timeEntries
      view = new App.Timesheet.MainPageView(users: @users, params: params)
      App.rootView.getRegion('content').show(view)

  user: (id, params) ->
    @index(params, id)

Router = Marionette.AppRouter.extend
  onRoute: -> App.vent.trigger('route', 'timesheet')
  appRoutes: {
    "timesheet": "index"
  }

new Router(controller: new Timesheetv2Controller())
