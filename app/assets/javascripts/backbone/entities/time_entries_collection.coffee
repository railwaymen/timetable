App.Entities.TimeEntryModel = Backbone.Model.extend
  modelName: 'TimeEntryModel'

  defaults: ->
    {
      duration: 0
      body: ''
      project_id: 0
    }

  url: ->
    if @id
      "/api/work_times/#{@id}"
    else
      '/api/work_times'

  validate: (attrs) ->
    body = $.trim attrs.body
    task = $.trim attrs.task
    project = @project()

    if !attrs.project_id
      return 'Error project id'

    if (!body.length && !task.length) && !project.isLunch() && !project.isAutofill()
      return 'Error body'

  startDate: ->
    moment(@get('starts_at'))

  endDate: ->
    moment(@get('ends_at'))

  startTime: ->
    @startDate().valueOf()

  duration: ->
    @get('duration') || 0

  formattedDuration: (withoutSeconds = false) ->
    timeUtils.secondsToHhmmss(@duration(), withoutSeconds)

  formattedDurationHHMMBig: ->
    out = timeUtils.secondsToSmallHhmm(@duration())

    if (out.length < 5)
      return '0' + out

    out

  isTracking: ->
    @get('duration') < 0

  formattedStartTime: ->
    moment(@startDate()).format timeUtils.DEFAULT_TIME_FORMAT

  formattedEndTime: ->
    moment(@endDate()).format timeUtils.DEFAULT_TIME_FORMAT

  formattedDate: ->
    moment(@endDate()).format "DD/MM/YYYY"

  project: ->
    return false if @get('project_id') == 0

    window.projects.get(id: @get('project_id'))

  allowsTask: ->
    window.projects.get(id: @get('project_id')).allowsWorkTimeTask()

App.Entities.TimeEntriesCollection = Backbone.Collection.extend
  model: App.Entities.TimeEntryModel
  modelName: 'TimeEntriesCollection'

  initialize: ->
    @params = {}

  url: ->
    "/api/work_times?#{$.param(@params)}"

  comparator: (te1, te2) ->
    te2.startTime() - te1.startTime()
