App.Timesheet.ProjectDropdownItemView = Marionette.ItemView.extend
  template: 'apps/timesheet/project_dropdown/project_dropdown_item'
  className: 'item'

  templateHelpers: ->
    {
      color: @model.getColor()
    }

  attributes: ->
    'data-value': @model.get('id')