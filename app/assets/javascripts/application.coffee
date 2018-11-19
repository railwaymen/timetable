#= require jquery
#= require react_ujs
#= require react
#= require URIjs
#= require momentjs
#= require momentjs/locale/pl
#= require momentjs-business
#= require eonasdan-bootstrap-datetimepicker
#= require bootstrap-sprockets
#= require semantic-ui
#= require timer.jquery
#= require lodash
#= require i18next
#= require i18n/translations

$ ->
  $('body').on 'click', '.icon.wait', ->
    $('#modal-info').addClass('active visible')

  $('body').on 'click', '#modal-info .button.cancel', ->
    $('#modal-info').removeClass('active visible')

  $('body').on 'click', '.dropdown', ->
    $(this).find('.menu').toggle()

  $('body').on 'click', '#generate, .modal-backdrop', ->
    $('#modal').toggle()

  $(document).on 'push-entry', (e) ->
    $("#work-time-#{e.detail.id}").addClass('new')
    setTimeout( ->
      $("#work-time-#{e.detail.id}").removeClass('new')
    , 600)

  $(document).on 'edit-entry', (e) ->
    $("#work-time-#{e.detail.id}").addClass('hotline-bling')
    setTimeout( ->
      $("#work-time-#{e.detail.id}").removeClass('hotline-bling')
    , 2500)
