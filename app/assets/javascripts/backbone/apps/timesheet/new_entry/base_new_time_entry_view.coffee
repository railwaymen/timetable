App.Timesheet.BaseNewTimeEntryView = Marionette.LayoutView.extend
  className: 'timer'
  template: 'apps/timesheet/new_entry/manual_new_time_entry'

  regions:
    dropdownRegion: '.project-dropdown'

  ui:
    task: '.task'
    description: '.description'
    startBtn: '.btn-start'

  events:
    'blur @ui.description': 'blurDescription'
    'blur @ui.task': 'blurTask'

  initialize: ->
    @projects = window.projects
    @saving = false

  onBeforeShow: ->
    firstEntry = timeEntries.first()
    firstEntryProject = firstEntry.project() if firstEntry
    selected = null

    if firstEntry? && firstEntryProject && !firstEntryProject.isLunch()
      selected = firstEntry.get('project_id')

    projectView = new App.Timesheet.ProjectDropdownView
      collection: @projects
      selected: selected
      onSave: (data) =>
        @model.set
          project_id: data.id

    @dropdownRegion.show projectView

  setTimeEntry: (model) ->
    @model = model

  resetTimeEntry: (lastProjectId) ->
    project = @model.project()
    if project && project.isLunch()
      oldProjectId = lastProjectId
    else if @model
      oldProjectId = @model.get('project_id')

    @setTimeEntry new App.Entities.TimeEntryModel
      project_id: oldProjectId

  blurTask: ->
    newTask = $.trim(@ui.task.val())
    if (newTask != @model.get('task'))
      @model.set
        task: newTask

  blurDescription: ->
    newDescription = $.trim(@ui.description.val())
    if (newDescription != @model.get('body'))
      @model.set
        body: newDescription

  newTimeEntryFormSubmit: ->
    if @saving
      return
    @model.set
      body: @ui.description.val(),
      task: @ui.task.val()

    userId = App.currentUser.get('id')

    if (id = new URI(Backbone.history.location).search(true).user_id)
      userId = id

    @model.set user_id: userId

    if !@model.isValid()
      alert 'There are some errors.'
      return

    @model.save null,
      beforeSend: =>
        @saving = true
        @ui.startBtn.prop('disabled', true)
      success: =>
        last = _.last(timeEntries.toJSON())
        lastProjectId = if last then last.project_id else @model.project_id
        timeEntries.add @model
        @model.trigger('highlight')

        if @ui.task
          @ui.task.val('')
        @ui.description.val('').focus()

        @resetTimeEntry(lastProjectId)
      error: (model, response) ->
        errors = response.responseJSON.errors
        firstErrorKey = _.keys(errors)[0]
        alert "#{firstErrorKey} : #{errors[firstErrorKey][0]}"
      complete: =>
        @saving = false
        @ui.startBtn.prop('disabled', false)
