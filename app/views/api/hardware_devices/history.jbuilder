# frozen_string_literal: true

json.array! @versions do |version|
  json.id version.id
  json.object_changes version.object_changes
  json.extract! version, :id, :event, :item_type
end
