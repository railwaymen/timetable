# frozen_string_literal: true

class ProjectResourceAssignment < ApplicationRecord
  self.inheritance_column = 'inheritance_type'

  belongs_to :user
  belongs_to :project_resource
  belongs_to :project
  belongs_to :vacation

  validates :starts_at, :ends_at, :resource_rid, :type, :user_id, :project_resource_id, :project_id, presence: true
end
