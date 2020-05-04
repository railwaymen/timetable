# frozen_string_literal: true

class ProjectResourceAssignment < ApplicationRecord
  include Discard::Model
  has_paper_trail
  self.inheritance_column = 'inheritance_type'

  belongs_to :user
  belongs_to :project_resource
  belongs_to :project
  belongs_to :vacation

  validates :starts_at, :ends_at, :resource_rid, :type, :user_id, :project_resource_id, :project_id, presence: true
  validate :validates_starts_at_less_than_ends_at

  def validates_starts_at_less_than_ends_at
    errors.add(:starts_at, :greater_than_ends_at) if starts_at && ends_at && starts_at >= ends_at
  end
end
