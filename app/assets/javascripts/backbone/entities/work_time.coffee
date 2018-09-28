App.Entities.WorkTime = Backbone.Model.extend
  url: ->
    if @id
      "/api/work_times/#{@id}"
    else
      '/api/work_times'

  initialize: ->
    @setNewAttr()

  setNewAttr: ->
    newAttrs = {}

    newAttrs.startDate = moment(@get('starts_at'))
    newAttrs.endDate   = moment(@get('ends_at'))

    duration = moment.duration(newAttrs.endDate.diff(newAttrs.startDate))
    newAttrs.durationMin = duration

    @set(newAttrs)


App.Entities.WorkTimes = Backbone.Collection.extend
  model: App.Entities.WorkTime
  initialize: ->
    @params = {}

  comparator: (item) ->
    -new Date(item.get('starts_at'))

  url: ->
    "/api/work_times?#{$.param(@params)}"


App.Entities.WorkTimesView = Backbone.Collection.extend
  model: App.Entities.WorkTime
  initialize: ->
    @params = {}

  url: ->
    "/api/reports/work_times?#{$.param(@params)}"

App.Entities.WorkTimesByUsersView = Backbone.Collection.extend
  model: App.Entities.WorkTime
  initialize: ->
    @params = {}

  url: ->
    "/api/reports/work_times/by_users?#{$.param(@params)}"
