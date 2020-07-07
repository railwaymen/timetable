# frozen_string_literal: true

class ProjectResource < ApplicationRecord
  include Discard::Model
  has_paper_trail
  belongs_to :user
  belongs_to :parent_resource, class_name: 'ProjectResource', foreign_key: 'project_resource_id', inverse_of: :child_resources
  has_many :child_resources, class_name: 'ProjectResource', inverse_of: :parent_resource, dependent: :destroy
  has_many :assignments, class_name: 'ProjectResourceAssignment', dependent: :destroy

  validates :rid, :name, presence: true
  validates :user_id, presence: true, if: proc { |r| !r.group_only }
  validates :rid, uniqueness: { scope: :discarded_at } # rubocop:disable Rails/UniqueValidationWithoutIndex

  after_discard do
    child_resources.discard_all
  end
end
