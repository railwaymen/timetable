App.Entities.PeriodsGenerator = Backbone.Model.extend
  url: ->
    "/api/accounting_periods/generate?#{$.param(@params)}"

  initialize: ->
    @params = {}
