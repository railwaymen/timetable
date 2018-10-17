App.AccountingPeriods.EditAccountingPeriodView = Backbone.Marionette.ItemView.extend
  template: 'apps/accounting_periods/edit_period'

  events:
    'click .btn-primary': 'save'

  bindings:
    '[name=user_id]': 'user_id'
    '[name=starts_at]': 'starts_at'
    '[name=ends_at]': 'ends_at'
    '[name=note]': 'note'
    '[name=hours]': 'hours'
    '[name=minutes]': 'minutes'
    '[name=closed]': 'closed'
    '[name=full_time]': 'full_time'
    '[name=position]': 'position'


  templateHelpers: ->
    users: @options.users.toJSON().filter (u) =>
      u.id == @options.model.get('user_id') || u.active == true

  onDomRefresh: ->
    @$('select[name="user_id"]').focus()

  onRender: ->
    @stickit()
    @$('[name=starts_at], [name=ends_at]').datetimepicker(format: 'YYYY-MM-DD HH:mm')
    @$('select').val(@model.get('user_id') || @model.userId)
    hours = parseInt((@model.get('duration') || 0) / 3600)
    minutes = parseInt(((@model.get('duration') || 0) % 3600) / 60)
    @model.set(hours: hours, minutes: minutes)
    unless @model.id
      @setPosition(@model.userId)

  save: ->
    duration = @model.get('hours') * 3600 + @model.get('minutes') * 60
    starts_at = if $('input[name=starts_at]').val() then moment(@$('input[name=starts_at]').val()).format('YYYY-MM-DD HH:mm') else ''
    ends_at = if $('input[name=ends_at]').val() then moment(@$('input[name=ends_at]').val()).format('YYYY-MM-DD HH:mm') else ''
    @model.set
      user_id: @$('select[name=user_id]').val()
      starts_at: starts_at
      ends_at: ends_at
      duration: duration
      position: parseInt(@$('input[name=position]').val())

    @model.save({}
      success: (model, response) =>
        userId = if model.get('user_id') then model.get('user_id') else @model.get('user_id')
        if userId
          href = "accounting_periods?user_id=#{userId}"
        else
          href = "accounting_periods"

        Backbone.history.navigate(href, {trigger: true})

      error: (model, response) =>
        @$('.form-group').removeClass('has-error')
        errors = $.parseJSON(response.responseText).errors
        _.each errors, (msg, field) ->
          if field is 'duration'
            @$('[name=hours]').parent().addClass('has-error')
            @$('[name=minutes]').parent().addClass('has-error')
          @$("[name=#{field}]").parent().addClass('has-error')

    )

  setPosition: (id) ->
    $.getJSON("/api/accounting_periods/next_position.json?user_id=#{id}", (response) =>
      @model.set(position: response)
    )
