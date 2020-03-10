# frozen_string_literal: true

class Event < ApplicationRecord
  self.inheritance_column = 'inheritance_type'

  belongs_to :user
  belongs_to :resource
  belongs_to :project
  belongs_to :vacation

  validates :starts_at, :ends_at, :resource_rid, :type, :user_id, :resource_id, :project_id, presence: true
end
