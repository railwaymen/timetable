App.AccountingPeriods.PeriodsGeneratorView = Backbone.Marionette.ItemView.extend
  template: 'apps/accounting_periods/generator'
  className: 'ui centered-modal modal'
  events:
    'click #generate': 'generate'

  onRender: ->
    @$el.modal 'show'

  generate: ->
    periods_count = @$('[name=periods_count]').val()
    month = @$('[name=month]').val()
    year = @$('[name=year]').val()
    @model.params.periods_count = periods_count
    @model.params.start_on = "#{year}-#{month}-01"
    @model.save({}
      success: (model, response) =>
        @collection.fetch()
        @$el.modal 'hide'

      error: (model, response) =>
        @$el.find('.field').addClass('error')


    )

  templateHelpers: ->
    years = []
    _(10).times (i) ->
      years.push (moment().year() + i)
    years: years
