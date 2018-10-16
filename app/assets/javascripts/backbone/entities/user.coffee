App.Entities.User = Backbone.Model.extend
  defaults:
    lang: 'pl'

  initialize: ->
    @listenTo @, 'change:id', @triggerChangedLoginState
    @listenTo @, 'change:admin', @triggerChangedAdminState

  isWithSpecialRoles: ->
    @isAdmin() || @isLeader() || @isManager()

  isAdmin: ->
    !!@get('admin')

  isLeader: ->
    @get('is_leader')

  isManager: ->
    !!@get('manager')

  isSigned: ->
    !!@get('id')

  triggerChangedLoginState: ->
    App.vent.trigger('changedLoginState')

  triggerChangedAdminState: (model, admin) ->
    previousAdmin = model.previous('admin')
    if (previousAdmin == undefined && admin == true) || (previousAdmin == true && admin == undefined)
      App.vent.trigger('changedAdminState')

  fullName: ->
    "#{@get('last_name')} #{@get('first_name')}"

App.Entities.Users = Backbone.Collection.extend
  model: App.Entities.User
  url: '/api/users'

  nextAfter: (user) ->
    @models[@indexOf(user) + 1]

  prevBefore: (user) ->
    @models[@indexOf(user) - 1]
