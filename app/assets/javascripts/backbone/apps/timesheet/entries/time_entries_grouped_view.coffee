App.Timesheet.TimeEntriesGroupedContentView = Marionette.CollectionView.extend
  childView: App.Timesheet.TimeEntriesGroupView

App.Timesheet.TimeEntriesGroupedView = Marionette.LayoutView.extend
  id: 'time-entry-list'
  template: 'apps/timesheet/entries/time_entries_grouped'

  regions:
    listRegion: '.box'

  monthsBack: 1

  serializeData: ->
    {
      months: @months
      durationAll: @calculateMonthSum()
    }

  initialize: (arg) ->
    parentCollection = arg.parentCollection
    @collection = new App.Entities.TimeEntriesGroupCollection()
    @setCollection(parentCollection)

    @months = @getLastMonths()
    @params = @options.params


  calculateMonthSum: ->
    if @parentCollection.length == 0
      return "00:00"

    currMonth = @parentCollection.first().startDate().month()
    dur = 0

    sum = @parentCollection.forEach (i) =>
      if i.startDate().month() == currentDate.month()
        dur += i.duration()

      return dur

    @formatDuration(dur)

  getLastMonths: ->
    months = []
    for month in [-1..48]
      today = moment().month()

      months.push moment().month(today - month)

    months

  findProjectName: (id) ->
    model = window.projects.find (model) -> model.get('id') is parseInt(id)
    model.get('name')

  formatDuration: (dur) ->
      dur = moment.duration(dur, 's')
      hrs = Math.floor(dur.asHours())
      min = dur.minutes()
      hrs = "0#{hrs}" if parseInt(hrs) < 10
      min = "0#{min}" if parseInt(min) < 10
      "#{hrs}:#{min}"

  templateHelpers: ->
    user = @options.users.get(@params.user_id)

    {
      user: "#{user.get('first_name')} #{user.get('last_name')}" if @params.user_id
      prevUserId: @options.users?.prevBefore(user)?.id
      nextUserId: @options.users?.nextAfter(user)?.id
      from: if @params.from then moment(@params.from).format() else moment().startOf('month').format()
      to: if @params.to then moment(@params.to).format() else moment().endOf('month').format()

      params: window.timeEntries.params

      currentMonth: =>
        if @params.from then moment(@params.from).format('MMMM') else null

      currentProject: =>
        if @params.project_id then @findProjectName(@params.project_id) else null

      fullTime: window.timeEntries.fullTime
      shouldWorked: @formatDuration(window.timeEntries.shouldWorked)
      periodDuration: @formatDuration(window.timeEntries.periodDuration)
      isCurrentMonth: moment(@params.from).month() is moment().month()

    }

  onRender: ->
    @$('.ui.dropdown').dropdown
      action: 'select'
    @$("[data-toggle='tooltip']").popup()

  resetCollection: ->
    newCollection = new App.Entities.TimeEntriesGroupCollection()
    ref = @parentCollection.models

    i = 0
    len = ref.length
    while i < len
      timeEntry = ref[i]

      newCollection.findOrCreateGroup(timeEntry).get('timeEntries').add(timeEntry)
      i++

    @collection.reset(newCollection.models)

  setCollection: (parentCollection) ->
    if (@parentCollection != null)
      @stopListening(@parentCollection)

    @parentCollection = parentCollection
    @resetCollection()

    @listenTo(@parentCollection, 'add', @timeEntryAdded)
    @listenTo(@parentCollection, 'add remove change', @refreshTotalTime)
    @listenTo(@parentCollection, 'remove', @resetCollection)


  refreshTotalTime: ->
    @$('h3 .work-time').text @calculateMonthSum()

  timeEntryAdded: (timeEntry) ->
    @collection.findOrCreateGroup(timeEntry).get('timeEntries').add(timeEntry)

  onBeforeShow: ->
    groupedView = new App.Timesheet.TimeEntriesGroupedContentView({
      collection: @collection
    })
    @listRegion.show(groupedView);
