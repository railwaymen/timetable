App.Entities.Project = Backbone.Model.extend
  isBodyOptional: ->
    (@isLunch || @isAutofill) && !App.currentUser.isAdmin()

  isLunch: ->
    @get('lunch')

  isAutofill: ->
    @get('autofill')

  allowsWorkTimeTask: ->
    @get('work_times_allows_task') == true

  defaults:
    active: true

  getColor: ->
    @get('color') || '000000'

App.Entities.Projects = Backbone.Collection.extend
  model: App.Entities.Project
  url: ->
    if @simple
      '/api/projects/simple'
    else
      '/api/projects'

  initialize: ->
    @params = {}

  sortProjects: (attr) ->
    if attr == @sortAttribute
      @sortDirection = -1 * @sortDirection
    else
      @sortAttribute = attr

    @sort()

  withoutIntern: ->
    filtered = @filter((item) ->
      return !item.isLunch() && !item.isAutofill()
    )

    return new App.Entities.Projects(filtered)
