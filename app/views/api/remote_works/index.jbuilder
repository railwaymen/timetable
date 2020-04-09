# frozen_string_literal: true

json.call(@remote_works, :total_count)
json.remote_works do
  json.partial! 'remote_work', collection: @remote_works, as: :remote_work
end
