# frozen_string_literal: true

json.array! @versions do |version|
  json.extract! version, :id, :event, :item_type
  if version.item_type == ProjectResourceAssignment.to_s
    item = version.next ? version.next.reify : version.item
    json.project_id item.project_id
    json.project_name item.project.name
    json.user_id item.user_id
    json.starts_at item.starts_at
    json.ends_at item.ends_at
    json.deleted version.changeset.include?('discarded_at')
  end
  json.name version.changeset['name'].try(:last) || version.item.name if version.item_type == ProjectResource.to_s
  json.creator_id version.whodunnit.to_i
end
