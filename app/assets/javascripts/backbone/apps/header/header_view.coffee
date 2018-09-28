App.Header.HeaderView = Backbone.Marionette.ItemView.extend
  template: 'apps/header/header'
  events:
    'click a.sign_out': 'signOut'

  initialize: ->
    @listenTo App.vent, 'route', @activateMenuItem

  activateMenuItem: (appName) ->
    @$('a.item').removeClass('active')
    @$("a.#{appName}").addClass('active')

  signOut: (e) ->
    e.preventDefault()
    $.ajax
      url: '/users/sign_out'
      type: 'DELETE'
      success: ->
        window.location = '/'

  templateHelpers: ->
    user: App.currentUser.fullName()
