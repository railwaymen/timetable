ReportsController = Marionette.Controller.extend
  initialize: ->
    @workTimes = new App.Entities.WorkTimesView()
    @byUserWorkTimes = new App.Entities.WorkTimesByUsersView()

  indexByProjects: (params = {}) ->
    if params.from
      dateFrom = moment(params.from, 'YYYY-MM-DDTHH:mm:ssZ')
    else
      dateFrom = moment().startOf('month')

    if params.to
      dateTo = moment(params.to, 'YYYY-MM-DDTHH:mm:ssZ')
    else
      dateTo = moment().endOf('month')

    @workTimes.params.from = dateFrom.format()
    @workTimes.params.to = dateTo.format()
    @workTimes.fetch().done =>
      view = new App.Reports.WorkTimesView(collection: @workTimes, dateFrom: dateFrom, dateTo: dateTo)
      App.rootView.getRegion('content').show(view)

  indexByUsers: (params = {}) ->
    dateFrom = if params.from then moment params.from else moment().startOf 'month'
    dateTo = if params.to then moment params.to else moment().endOf 'month'

    @byUserWorkTimes.params.from = dateFrom.format()
    @byUserWorkTimes.params.to = dateTo.format()
    @byUserWorkTimes.fetch().done =>
      view = new App.Reports.WorkTimesByUsersView(collection: @byUserWorkTimes, dateFrom: dateFrom, dateTo: dateTo)
      App.rootView.getRegion('content').show(view)

Router = Marionette.AppRouter.extend
  onRoute: -> App.vent.trigger('route', 'reports')
  appRoutes: {
    "reports/work_times/by_projects": "indexByProjects"
    "reports/work_times/by_users": "indexByUsers"
  }

new Router(controller: new ReportsController())
