App.Timesheet.TimeEntryView = Backbone.Marionette.LayoutView.extend
  tagName: 'li'
  className: ->
    if @model.get('updated_by_admin')
      return 'entry updated'

    return 'entry'

  template: 'apps/timesheet/entries/time_entry_list_item'

  ui:
    descriptionContainer: '.description-container'
    descriptionInput: '.description-input'
    taskInput: '.task-input'
    descriptionText: '.description-text'
    projectContainer: '.project-pill'
    editTimeContainer: '.edit-time'
    timeContainer: '.time-container'
    timeStartInput: '.start-input'
    timeEndInput: '.end-input'
    destroy: '.destroy'
    history: '.history'
    date: '#date'

  events:
    'click @ui.descriptionContainer': 'clickEditDescription'
    'click @ui.projectContainer': 'clickEditProject'
    'click @ui.timeContainer': 'clickEditTime'
    'blur @ui.timeStartInput': 'onBlurPeriod'
    'blur @ui.timeEndInput': 'onBlurPeriod'
    'click @ui.destroy': 'destroyItem'
    'click @ui.history': 'renderHistory'
    'keypress textarea, input': 'onKeypress'

  regions:
    projectsRegion: '.projects-region'

  editing: false

  serializeData: ->
    projectId = parseInt @model.get('project_id')
    project = projects.where({id: projectId})[0]

    {
      body: @formatBody()
      task: @model.get('task')
      project: project.get('name')
      projectColor: project.getColor()
      date: @formatDate()
      duration: @formatDuration()
      canRemove: @canEdit()
      projectAllowTask: @model.allowsTask()
    }

  modelEvents:
    'change': 'render'
    'change:body': 'updateDescription'
    'highlight': 'highlight'

  highlight: ->
    @$el.transition('flash', 2000)

  destroyItem: ->
    alert = confirm(i18next.t('common.confirm'))
    if alert
      @model.destroy()
      @destroy()

  renderHistory: ->
    @model.fetch().done =>
      view = new App.Timesheet.WorkTimeHistoryView(model: @model)
      App.rootView.getRegion('modal').show(view)

  canEdit: ->
    if App.currentUser.isAdmin()
      return true
    else if @model.startDate().isBefore(moment('00:00', 'HH:mm').businessSubtract(3))
      return false
    else if App.currentUser.isManager && @model.get('user_id') != App.currentUser.id
      return false

    return true

  formatBody: ->
    if @model.project().isLunch() && !@model.get('body')
      '...Omnomnomnom...'
    else
      new String(@model.get('body')).replace(new RegExp('\n','g'), '<br />') || '[ No description ]'

  formatDate: ->
    start = @model.startDate().format('HH:mm')
    end = @model.endDate().format('HH:mm')

    "#{start} - #{end}"

  onKeypress: (e) ->
    if e.keyCode == 13 && !e.shiftKey
      className = e.target.classList[0]
      if className == 'end-input' || className == 'start-input'
        @endEditDate()
      else
        @endEditDescription()


  formatDuration: ->
    startDate = moment(@model.startDate())
    endDate = moment(@model.endDate())
    duration = if !@model.project().get('count_duration')
                moment.duration(0)
               else
                moment.duration(endDate.diff(startDate))

    hrs = @prependZero(duration.hours())
    min = @prependZero(duration.minutes())
    "#{hrs}:#{min}"

  prependZero: (val) ->
    val = parseInt(val)
    zero = ''

    zero = '0' if(val < 10)

    zero + val

  onBlurPeriod: ->
    start = moment(timeUtils.softToTimeOfDay(@ui.timeStartInput.val()))
    end = moment(timeUtils.softToTimeOfDay(@ui.timeEndInput.val()))

    @ui.timeStartInput.val(start.format('HH:mm'))
    @ui.timeEndInput.val(end.format('HH:mm'))

  clickEditDescription: ->
    if !@editing && @canEdit()
      @startEditDescription()

  clickEditProject: (e) ->
    if !@editing && @canEdit()
      @startEditProject()

  clickEditTime: ->
    if !@editing && @canEdit()
      @startEditTime()

  startEditProject: ->
    projectView = new App.Timesheet.ProjectDropdownView
      collection: window.projects
      activeId: @model.get('project_id')
      editing: true
      onSave: (data) =>
        @endEditProject(data)

    @projectsRegion.show projectView
    @openEditMode()

    $(document).on 'mouseup.timeEntryView', (e) =>
      if e.target.className != 'item' &&
         !e.target.classList.contains('menu')

        @endEditProject(@model.get('project_id'))

  startEditDescription: ->
    @openEditMode()

    description = @model.get('body')
    @ui.descriptionInput.val(description).show().focus()

    $(document).on 'mouseup.timeEntryView', (e) =>
      @endEditDescription() if e.target.tagName != 'INPUT'

  startEditTime: ->
    @openEditMode()
    @initDatetimeInput()

    @ui.editTimeContainer.show()
    @ui.date.show()

    @ui.timeStartInput.val(@model.formattedStartTime()).show().focus()
    @ui.timeEndInput.val(@model.formattedEndTime()).show()
    @ui.date.val(@model.formattedDate())

    $(document).on 'mouseup.timeEntryView', (e) =>
      @endEditDate() if e.target.tagName != 'INPUT' && !$(e.target).is('.day')

  updateDescription: ->
    @ui.descriptionText.text(@model.get('body'))

  openEditMode: ->
    if @editing
      return

    @$el.addClass 'edit-mode'
    @editing = true

  closeEditMode: ->
    @$el.removeClass 'edit-mode'
    @editing = false
    @$('input, textarea').hide()

  endEditDate: ->
    @closeEditMode()
    $(document).off('.timeEntryView')

    starts = timeUtils.changeDate(@ui.timeStartInput.val(), @ui.date.val())
    ends = timeUtils.changeDate(@ui.timeEndInput.val(), @ui.date.val())

    @saveEntry
      duration: ends.diff(starts, 'seconds')
      starts_at: starts.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
      ends_at: ends.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
      , @replaceModel

  replaceModel: (model) ->
    timeEntries.remove model
    timeEntries.add model

  endEditDescription: ->
    @closeEditMode()
    $(document).off('.timeEntryView')

    description = @ui.descriptionInput.val()
    task = @ui.taskInput.val()

    @saveEntry
      body: description
      task: task

  endEditProject: (data) ->
    @closeEditMode()
    $(document).off('.timeEntryView')

    if !@model || @model && data.id == @model.get('project_id')
      return

    @saveEntry
      project_id: data.id

    if (ref = @projectsRegion) != null
      ref.reset()
      ref.destroy()

  initDatetimeInput: ->
    @$(@ui.date).datetimepicker
      format: 'DD/MM/YYYY'
      defaultDate: @model.get('starts_at')
      minDate: moment('00:00', 'HH:mm').businessSubtract(3) if !App.currentUser.isAdmin()

  saveEntry: (data, callback) ->
    changed = _.any data, (val, key) =>
      @model.get(key) != val

    if !changed
      return

    @model.save(data, { wait: true })
      .error (response) =>
        @model.fetch()
        errors = response.responseJSON.errors
        firstErrorKey = _.keys(errors)[0]
        alert "#{firstErrorKey} : #{errors[firstErrorKey][0]}"
      .success () =>
        if callback && typeof callback == 'function'
          callback(@model)

App.Timesheet.TimeEntriesView = Backbone.Marionette.CollectionView.extend
  childView: App.Timesheet.TimeEntryView
  tagName: 'ul'
  className: 'time-entries-list'
