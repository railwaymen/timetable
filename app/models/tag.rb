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
    errors.add(:name, :taken) if project_id.nil? && Tag.kept.where.not(id: id).where(name: name).exists?
    errors.add(:name, :taken) if project_id.present? &&
                                 (Tag.kept.where.not(id: id).where(project_id: nil, name: name).exists? || Tag.kept.where.not(id: id).where(project_id: project_id, name: name).exists?)
  end
end
