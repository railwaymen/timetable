# frozen_string_literal: true

class Tag < ApplicationRecord
  include Discard::Model
  include FilterConcern

  has_many :taggings, dependent: :destroy
  has_many :work_times, dependent: :nullify
  belongs_to :project

  validates :name, presence: true
  validate :validates_name_uniqueness

  def validates_name_uniqueness
    errors.add(:name, :taken) if project_id.nil? && Tag.kept.where.not(id: id).exists?(name: name)
    errors.add(:name, :taken) if project_id.present? &&
                                 (Tag.kept.where.not(id: id).exists?(project_id: nil, name: name) || Tag.kept.where.not(id: id).exists?(project_id: project_id, name: name))
  end
end
