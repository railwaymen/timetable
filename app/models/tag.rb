# frozen_string_literal: true

class Tag < ApplicationRecord
  include Discard::Model
  include FilterConcern

  has_many :taggings, dependent: :destroy
  has_many :work_times, dependent: :nullify
  belongs_to :project

  validates :name, presence: true
  validates :name, uniqueness: { scope: :project_id, conditions: -> { where(discarded_at: nil) } }

  validate :validates_global_name

  def validates_global_name
    errors.add(:name, :taken) if Tag.kept.where.not(id: id).where(project_id: nil, name: name).exists?
  end
end
