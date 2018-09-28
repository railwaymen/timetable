App.Shared.ModalRegion = Backbone.Marionette.Region.extend
  el: '#modal'

  initialize: ->
    @on 'show', @showModal, @
    @on 'destroy', @hideModal, @

  getEl: (selector) ->
    $el = $(selector)
    $el.on 'hidden', @close
    $el

  showModal: (view) ->
    $('.ui.modal').modal 'show'

  hideModal: ->
    $('.ui.modal').modal 'hide'
