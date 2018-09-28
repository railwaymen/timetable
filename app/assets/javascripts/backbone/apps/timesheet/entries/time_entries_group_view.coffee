App.Timesheet.TimeEntriesGroupView = Backbone.Marionette.LayoutView.extend
  tagName: 'section'
  className: 'time-entries-day'
  template: 'apps/timesheet/entries/time_entries_group'

  ui:
    title: '.date-container .title'
    totalTimeTracked: '.date-container .super'

  regions:
    listRegion: '.time-entries-list-container'

  templateHelpers: ->
    {
      totalTimeTracked: @totalTimeTracked()
    }

  initialize: ->
    @listenTo(@model.get('timeEntries'), 'change:duration add remove reset', @refreshTotalTimeTracked);

  onRender: ->
    @listRegion.show new App.Timesheet.TimeEntriesView
      collection: @model.get('timeEntries')

  refreshTotalTimeTracked: ->
    @ui.totalTimeTracked.html(@totalTimeTracked())

  totalTimeTracked: ->
    sum = @model.get('timeEntries').reduce(((sum, timeEntry) ->
      sum + timeEntry.duration()
    ), 0)

    dur = moment.duration(sum, 'seconds')
    hrs = dur.hours()
    min = dur.minutes()
    hrs = "0#{hrs}" if parseInt(hrs) < 10
    min = "0#{min}" if parseInt(min) < 10

    "#{hrs}:#{min}"
