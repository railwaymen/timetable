App.Shared.RootView = Marionette.LayoutView.extend
  el: 'body'
  regions:
    header: 'nav'
    content: '#content'
    modal: App.Shared.ModalRegion
