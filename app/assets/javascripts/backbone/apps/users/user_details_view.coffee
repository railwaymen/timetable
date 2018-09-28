App.Users.UserDetailsView = Backbone.Marionette.ItemView.extend
  template: 'apps/users/user_details'
  templateHelpers: ->
    {
      leaderProjectNames: _.pluck(@model.get('projects'), 'name')
    }
