#= require ./user_view

App.Users.UsersView = Backbone.Marionette.CompositeView.extend
  template: 'apps/users/users'
  childView: App.Users.UserView
  childViewContainer: 'tbody'

  initialize: ->
    @collection.params ||= {}

  templateHelpers: ->
    {
      params: @collection.params 
    }

  events:
    'change #filter': 'filterUsers'

  filterUsers: ->
    @collection.params.filter = @$('#filter').val()
    @collection.fetch(data: @collection.params).done =>
      @render()
