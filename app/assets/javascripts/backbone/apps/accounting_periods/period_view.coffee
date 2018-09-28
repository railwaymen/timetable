App.AccountingPeriods.PeriodView = Backbone.Marionette.ItemView.extend
  template: 'apps/accounting_periods/period'
  tagName: 'tr'

  ui:
    delete: '.delete'

  events:
    'click @ui.delete': 'delete'

  templateHelpers: ->
    userName:
      if @options.users
        @options.users.get(@model.get('user_id')).fullName()
      else
        App.currentUser.fullName()

    note: new String(@model.get('note') || '').replace(/\n/g, '<br />')
    accountingPeriodId: @model.id
    userId: @model.collection.params.user_id
    currentPage: @model.collection.state.currentPage

    to:
      if @model.get('ends_at') then moment(@model.get('ends_at')).format('YYYY-MM-DD') else null


  delete: ->
    bootbox.confirm i18next.t('common.confirm'), (confirmed) =>
      @model.destroy() if confirmed

  onRender: ->
    @stickit()
