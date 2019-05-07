# frozen_string_literal: true

json.array! @reports, :id, :starts_at, :ends_at, :state, :name
