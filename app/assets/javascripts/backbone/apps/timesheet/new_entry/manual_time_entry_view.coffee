App.Timesheet.ManualTimeEntryView = App.Timesheet.BaseNewTimeEntryView.extend
  template: 'apps/timesheet/new_entry/manual_time_entry'

  ui:
    description: '.description'
    task: '.task'
    taskUrl: '.task-url'
    duration: '#duration'
    startDate: '#start'
    endDate: '#end'
    date: '#date'
    dateView: '#date-view'
    save: '#save'
    startBtn: '.btn-start'

  events: ->
    'click @ui.startBtn': 'newTimeEntryFormSubmit'
    'keypress textarea, input': 'onKeypress'
    'blur @ui.startDate': 'onBlurPeriodStart'
    'blur @ui.endDate': 'onBlurPeriodEnd'
    'dp.change @ui.date': 'onChangeDate'

  templateHelpers: ->
    formattedStartTime: =>
      if @model
        @model.formattedStartTime()
      else
        moment().format(timeUtils.timeOfDayFormat())

    formattedEndTime: =>
      if @model
        @model.formattedEndTime()
      else
        moment().format(timeUtils.timeOfDayFormat())

    formattedDuration: =>
      if @model
        @model.formattedDuration(true) || '00:00'
      else
        '00:00'

  onBeforeShow: ->
    if !@model
      @resetTimeEntry()

    App.Timesheet.ManualTimeEntryView.__super__.onBeforeShow.apply @

  onShow: ->
    defDate = moment()

    if App.currentUser.isAdmin()
      defDate = currentDate

      if moment().month() == currentDate.month()
        defDate = moment()

    @$(@ui.date).datetimepicker
      format: 'DD/MM/YYYY'
      defaultDate: defDate
      minDate: moment('00:00', 'HH:mm').businessSubtract(3) if !App.currentUser.isAdmin()

  onKeypress: (e) ->
    if e.keyCode == 13 && !e.shiftKey
      @$(e.currentTarget).blur()
      @newTimeEntryFormSubmit()

  resetTimeEntry: ->
    oldModel = @model
    newModel = new App.Entities.TimeEntryModel()

    @setTimeEntry newModel

    if oldModel
      newStart = oldModel.endDate()
      newStop = timeUtils.mergeTimeAndDate(oldModel.get('ends_at'), oldModel.startDate())
      newProject = oldModel.get('project_id')

      if oldModel.project().get('lunch') && timeEntries.at(1)
        newProject = timeEntries.at(1).get('project_id')

      newModel.set
        duration: (newStop - newStart) / 1000
        starts_at: newStart.format()
        ends_at: newStop.format()
        project_id: newProject

  setTimeEntry: (model) ->
    @listenTo model, 'change:duration change:starts_at change:ends_at', =>
      @setPeriodValues() if @model.isNew()
      project = @model.project()
      if project && project.get('count_duration')
        dur = model.formattedDurationHHMMBig()
      else
        dur = '00:00'

      @ui.duration.text dur

    @listenTo model, 'change:project_id change:starts_at change:ends_at', =>
      project = @model.project()
      if project && project.get('lunch')
        @ui.description.val('').prop('disabled', true)
      else
        @ui.description.prop('disabled', false)

    @listenTo model, 'change:project_id', =>
      project = @model.project()
      @$('.ui.dropdown').dropdown 'set selected', @model.get('project_id')
      @ui.taskUrl.toggle(@model.allowsTask())

      if project.isAutofill() && @model.isNew()
        start = @model.startDate()
        end   = @model.endDate()
        @model.set
          starts_at: start.set('hours', 9).set('minutes', 0).format()
          ends_at: end.set('hours', 17).set('minutes', 0).format()
          duration: 60 * 60 * 8

      else if project.isLunch() && @model.isNew()
        end = @model.startDate().add(30, 'minutes')
        @model.set
          ends_at: end
          duration: end.diff(@model.startDate(), 'seconds')

      else
        end = @model.endDate()
        @model.set
          duration: end.diff(@model.startDate(), 'seconds')

      if !project.get('count_duration')
        @model.set
          duration: 0

    App.Timesheet.ManualTimeEntryView.__super__.setTimeEntry.call @, model

  onBlurPeriodStart: ->
    if @model.duration() > 0
      startTime = @parsePeriodTime(@ui.startDate.val())
      endTime = @parsePeriodTime(@ui.endDate.val())

      if !startTime
        return

      mstartDate = timeUtils.mergeTimeAndDate(startTime, @model.startDate())
      mendDate = timeUtils.mergeTimeAndDate(endTime, @model.endDate())
      @model.set
        duration: (mendDate - mstartDate) / 1000
        starts_at: mstartDate.format()
        ends_at: @model.endDate().format()

    else
      @onBlurPeriodEnd()

  onBlurPeriodEnd: ->
    startTime = @parsePeriodTime(@ui.startDate.val())
    endTime = @parsePeriodTime(@ui.endDate.val())

    if !startTime && !endTime
      return

    mstartDate = timeUtils.mergeTimeAndDate(startTime, @model.startDate())
    mendDate = timeUtils.mergeTimeAndDate(endTime, @model.endDate())

    if(endTime.getHours() == 0 && endTime.getDate() != startTime.getDate())
      startDiff = moment(endTime).diff(startTime, 'days')

      if startDiff == 0
        startDiff = 1

      if mendDate.date() == mstartDate.date()
        mendDate.add days: startDiff

    else if(endTime >= startTime)
      mendDate = timeUtils.mergeTimeAndDate(endTime, mstartDate)
    else if(mendDate < mstartDate)
      mendDate = timeUtils.mergeTimeAndDate(endTime, mstartDate).add
        days: 1

    @model.set
      duration: (mendDate - mstartDate) / 1000
      starts_at: mstartDate.format()
      ends_at: mendDate.format()

  onChangeDate: (e) ->
    mstartDate = timeUtils.mergeTimeAndDate(@model.startDate(), e.date)
    mendDate = timeUtils.mergeTimeAndDate(@model.endDate(), e.date)

    $(@ui.dateView).val(e.date.format('DD/MM'))

    @model.set
      duration: (mendDate - mstartDate) / 1000
      starts_at: mstartDate.format()
      ends_at: mendDate.format()

  parsePeriodTime: (stime) ->
    stime = stime.replace(/[;.]/g, ':');

    timeUtils.softToTimeOfDay(stime)

  setPeriodValues: ->
    fstartTime = @model.formattedStartTime()
    fstopTime = @model.formattedEndTime()

    @ui.startDate.val(fstartTime)
    @ui.endDate.val(fstopTime)
