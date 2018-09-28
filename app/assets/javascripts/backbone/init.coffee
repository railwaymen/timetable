window.App = new Marionette.Application()
App.Entities = {}

App.on 'start', (options) ->
  resources = {}
  resources[App.currentUser.get('lang')] = translation: options.locales
  i18next.init
    lng: App.currentUser.get('lang')
    resources: resources
    saveMissing: true
    missingKeyHandler: (lng, ns, key) -> throw Error("Missing translation for key: #{key}")

  moment.locale(App.currentUser.get('lang'), week: { dow: 1 })

  App.config = options.config
  App.rootView = new App.Shared.RootView()
  headerView = new App.Header.HeaderView(model: App.currentUser)
  App.rootView.getRegion('header').show(headerView)
  Backbone.history.start(pushState: true)

Backbone.Marionette.Renderer.render = (template, data) ->
  templateBase = 'backbone/'
  JST["#{templateBase}#{template}"](data) if template

HAML.globals = ->
  currentUser: App.currentUser
  formatDuration: (duration) ->
    h = parseInt(duration / 3600)
    m = parseInt((duration % 3600) / 60)
    m = '0' + m if m < 10
    h = '0' + h if h < 10
    "#{h}:#{m}"
  t: i18next.t.bind(i18next)

$ ->
  tokenValue = $('meta[name=\'csrf-token\']').attr('content')
  $.ajaxSetup(headers: 'X-CSRF-Token': tokenValue)
