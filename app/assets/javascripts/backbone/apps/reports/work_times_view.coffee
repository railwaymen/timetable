App.Reports.WorkTimesView = Backbone.Marionette.ItemView.extend
  template: 'apps/reports/work_times'

  events:
    'click .btn-group': 'switchActiveButton'
    'click .filter': 'filterByCustomDates'

  templateHelpers: ->
    previousParams =
      from: @options.dateFrom.clone().subtract(1, 'month').startOf('month').format()
      to: @options.dateFrom.clone().subtract(1, 'month').endOf('month').format()

    nextParams =
      from: @options.dateFrom.clone().add(1, 'month').startOf('month').format()
      to: @options.dateFrom.clone().add(1, 'month').endOf('month').format()

    {
      monthName: @options.dateFrom.format('MMMM')
      yearNumber: @options.dateFrom.format('YYYY')
      previousParams: previousParams
      nextParams: nextParams
      from: encodeURIComponent @options.dateFrom.format()
      to: encodeURIComponent @options.dateTo.format()
      entries: _.groupBy(@collection.toJSON(), 'project_name')
    }

  switchActiveButton: (e) ->
    btns = $(e.delegateTarget).find('.btn-group .btn')
    _.each(btns, (btn) ->
      @$(btn).toggleClass('active')
    )

  onRender: ->
    @$('[name=from], [name=to]').datetimepicker(format: 'YYYY-MM-DD')

  filterByCustomDates: ->
    params =
      from: moment(@$('[name=from]').val()).startOf('day').format()
      to: moment(@$('[name=to]').val()).endOf('day').format()

    Backbone.history.navigate("reports/work_times/by_projects?#{$.param(params)}", {trigger: true})
