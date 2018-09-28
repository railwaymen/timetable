#= require backbone.paginator

App.Entities.AccountingPeriod = Backbone.Model.extend
  url: ->
    if @id
      "/api/accounting_periods/#{@id}"
    else
      '/api/accounting_periods'

App.Entities.AccountingPeriods = Backbone.PageableCollection.extend
  model: App.Entities.AccountingPeriod
  url: ->
    "/api/accounting_periods?#{$.param(@params)}"

  initialize: ->
    @params = {}

  parse: (response) ->
    @state.totalRecords = response.total_count
    @recounting = response.recounting
    response.accounting_periods
