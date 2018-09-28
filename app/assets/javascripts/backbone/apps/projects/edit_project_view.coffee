App.Projects.EditProjectView = Backbone.Marionette.ItemView.extend
  template: 'apps/projects/edit_project'
  events:
    'click .btn-primary': 'save'
  bindings:
    '[name=name]': 'name'
    '[name=active]': 'active'
    '[name=work_times_allows_task]': 'work_times_allows_task'

  templateHelpers: ->
    {
      users: @options.users.toJSON()
    }

  onDomRefresh: ->
    @$('input[name="name"]').focus()

  onRender: ->
    @stickit()
    @$('#developers, #testers').tokenize()
    @$('.ui.dropdown').dropdown()
    @$('.ui.dropdown').dropdown('set selected', @model.get('color'))

  save: ->
    @model.set
      color: @$('input[type="color"]').val().replace('#', '')
      leader_id: @$('#leader').val()

    @model.save().done -> Backbone.history.navigate('projects/list', {trigger: true})
