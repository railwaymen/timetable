App.Entities.TimeEntriesGroupCollection = Backbone.Collection.extend
  model: App.Entities.TimeEntriesGroup

  comparator: (a, b) ->
    if(a.get('groupId') > b.get('groupId'))
      return -1

    if(a.get('groupId') < b.get('groupId'))
      return 1

    return 0

  findOrCreateGroup: (model) ->
    group = @findGroup(model)

    if(!group)
      group = @add new App.Entities.TimeEntriesGroup
        timeEntries: new App.Entities.TimeEntriesCollection()
        groupId: @createGroupId(model.startDate())
        title: @createGroupTitle(model)

    group

  findGroup: (timeEntry) ->
    @find ((_this) ->
        (model) ->
          model.get('groupId') == _this.createGroupId(timeEntry.startDate())
      )(this)

  createGroupId: (startDate) ->
    startDate.format 'YYYYMMDD'

  createGroupTitle: (model) ->
    @_today = today = moment()
    date = model.startDate()

    if(date.month() == today.month() && date.year() == today.year())
      if(date.date() == today.date())
        return i18next.t('common.today')

      if(date.date() == (today.date() - 1))
        return i18next.t('common.yesterday')

      date.format('ddd, D MMM')
    else
      date.format('ddd, D MMM YYYY')

