# frozen_string_literal: true

json.call(@remote_works, :total_pages)
json.records do
  json.partial! 'remote_work', collection: @remote_works, as: :remote_work
end
