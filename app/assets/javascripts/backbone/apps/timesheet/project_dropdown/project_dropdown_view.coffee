App.Timesheet.ProjectDropdownView = Marionette.CompositeView.extend
  template: 'apps/timesheet/project_dropdown/project_dropdown'
  childView: App.Timesheet.ProjectDropdownItemView
  childViewContainer: '.menu'

  initialize: ->
    if !App.currentUser.isAdmin()
      filteredCollection = _.filter @collection.toJSON(), (project) =>
        project.id == @options.activeId || project.active

      @collection = new App.Entities.Projects(filteredCollection)

  templateHelpers: ->
    {
      projectId: @options.activeId
    }

  onSaveDropdown: (e) ->
    id = @$('.ui.dropdown').dropdown('get value') || 0

    color = projects.findWhere(id: parseInt(id)).getColor() if id != 0

    @$('.text').css('background', '#' + color)

    @options.onSave({id: id})

  onShow: ->
    @$('.ui.dropdown').dropdown
      onChange: (value, text) =>
        @onSaveDropdown()

    if (id = @options.activeId)
      @$('.ui.dropdown').dropdown 'show'
    else
      @onSaveDropdown()

    if (id = @options.selected)
      @$('.ui.dropdown').dropdown 'set selected', id
