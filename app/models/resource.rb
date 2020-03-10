# frozen_string_literal: true

class Resource < ApplicationRecord
  belongs_to :user
  belongs_to :parent_resource, class_name: 'Resource', foreign_key: 'resource_id'
  has_many :child_resources, class_name: 'Resource', foreign_key: 'resource_id', dependent: :destroy
  has_many :events, dependent: :destroy

  validates :rid, :name, presence: true
  validates :user_id, presence: true, if: proc { |r| !r.group_only }
  validates :rid, uniqueness: true
end
