# frozen_string_literal: true

class ProjectResource < ApplicationRecord
  belongs_to :user
  belongs_to :parent_resource, class_name: 'ProjectResource', foreign_key: 'project_resource_id'
  has_many :child_resources, class_name: 'ProjectResource', foreign_key: 'project_resource_id', dependent: :destroy
  has_many :assignments, class_name: 'ProjectResourceAssignment', dependent: :destroy

  validates :rid, :name, presence: true
  validates :user_id, presence: true, if: proc { |r| !r.group_only }
  validates :rid, uniqueness: true
end
