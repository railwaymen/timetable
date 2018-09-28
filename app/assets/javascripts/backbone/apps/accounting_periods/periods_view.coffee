#= require ./period_view

App.AccountingPeriods.PeriodsView = Backbone.Marionette.CompositeView.extend
  template: 'apps/accounting_periods/periods'
  childView: App.AccountingPeriods.PeriodView
  childViewContainer: 'tbody'
  childViewOptions: ->
    users: @options.users

  initialize: ->
    @collection.state.currentPage = 1
    @totalRecords = @collection.state.totalRecords
    if @collection.recounting
      @checkRecountingStatusInterval()
    @listenTo App.vent, 'route', @stopCheckRecountingStatus

  collectionEvents:
    'refresh': 'render'

  events:
    'click #prevPage': 'prevPage'
    'click #nextPage': 'nextPage'
    'click .page': 'getPage'
    'click #generate': 'showGeneratorModal'
    'click #recount': 'recountPeriods'

  templateHelpers: ->
    totalPages: if @totalRecords > 0 then Math.ceil(@totalRecords / 25) else 1
    currentPage: @collection.state.currentPage
    userName: @options.user.fullName()
    userId: @options.user.id
    prevUserId: @options.users?.prevBefore(@options.user)?.id
    nextUserId: @options.users?.nextAfter(@options.user)?.id
    isRecounting: @collection.recounting

  prevPage: ->
    @collection.getPreviousPage()
    @collection.fetch().done => @collection.trigger('refresh')

  nextPage: ->
    @collection.getNextPage()
    @collection.fetch().done => @collection.trigger('refresh')

  getPage: (e) ->
    @collection.getPage(parseInt(e.target.dataset.page))
    @collection.fetch().done => @collection.trigger('refresh')

  showGeneratorModal: (e) ->
    e.preventDefault()
    generator = new App.Entities.PeriodsGenerator()
    generator.params.user_id = @options.user.id
    generatorView = new App.AccountingPeriods.PeriodsGeneratorView(model: generator, collection: @collection)
    App.rootView.getRegion('modal').show(generatorView)
    @$el.find('#generate').blur()

  checkRecountingStatusInterval: ->
    @checkRecount = setInterval(@checkRecountingStatus.bind(this), 1500)

  disableRecountButton: ->
    @$('#recount').text(i18next.t('apps.accounting_periods.recounting')).blur()
    @$('#recount').attr('disabled', true)

  recountPeriods: (e) ->
    e.preventDefault()
    return if @$('#recount').attr('disabled')
    @disableRecountButton()
    $.post( "/api/accounting_periods/recount.json?user_id=#{@options.user.id}",
      (resp) =>
        @jid = resp.jid
    ).done =>
      @checkRecountingStatusInterval()

  checkRecountingStatus: ->
    $.getJSON("/api/accounting_periods/recount_status.json?jid=#{@jid}&user_id=#{@options.user.id}", (data) =>
      if data.complete
        @$('#recount').text('Recount periods').blur()
        clearInterval(@checkRecount)
        @collection.fetch().done => @collection.trigger 'refresh'
      else
        @jid = data.jid
        @disableRecountButton()
    )

  stopCheckRecountingStatus: ->
    clearInterval(@checkRecount)
