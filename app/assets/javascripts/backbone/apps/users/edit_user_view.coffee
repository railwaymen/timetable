App.Users.EditUserView = Backbone.Marionette.ItemView.extend
  template: 'apps/users/edit_user'
  events:
    'click .btn-primary': 'save'
  bindings:
    '[name=email]': 'email'
    '[name=first_name]': 'first_name'
    '[name=last_name]': 'last_name'
    '[name=phone]': 'phone'
    '[name=contract_name]': 'contract_name'
    '[name=lang]': 'lang'
    '[name=active]': 'active'

  onRender: ->
    @stickit()
    @oldLang = @model.get('lang')

  save: ->
    @model.save {},
      success: (model, response) =>
        if model.get('lang') != @oldLang
          location.reload(true)
        else
          Backbone.history.history.back()
