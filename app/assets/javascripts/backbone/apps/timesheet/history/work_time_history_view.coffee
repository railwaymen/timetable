App.Timesheet.WorkTimeHistoryView = Backbone.Marionette.ItemView.extend
  template: 'apps/timesheet/history/work_time_history'
  className: 'ui modal'

  templateHelpers: ->
    if @options.userId
      ref = { user: @options.users.get(@options.userId).toJSON() }
    else
      ref = { user: App.currentUser.toJSON() }

    ref.date = @model.startDate().format('HH:mm DD/MM')

    ref