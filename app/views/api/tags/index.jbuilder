# frozen_string_literal: true

json.call(@tags, :total_pages)
json.records do
  json.partial! 'tag', collection: @tags, as: :tag
end
