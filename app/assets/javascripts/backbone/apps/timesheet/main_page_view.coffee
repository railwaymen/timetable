App.Timesheet.MainPageView = Marionette.LayoutView.extend
  template: 'apps/timesheet/main_page'

  regions:
    contentRegion: '.content-wrapper'
    newEntryRegion: '.new-entry'

  onBeforeShow: ->
    window.newEntry = new App.Timesheet.ManualTimeEntryView(collection: window.timeEntries)
    @newEntryRegion.show(newEntry)

    @renderTimeEntriesRegion()

  renderTimeEntriesRegion: ->
    groupedView = new App.Timesheet.TimeEntriesGroupedView(parentCollection: window.timeEntries, users: @options.users, params: @options.params)
    @contentRegion.show(groupedView)
