# frozen_string_literal: true

class RemoteWork < ApplicationRecord
  has_paper_trail skip: %i[updated_by_admin]
  belongs_to :user
  belongs_to :creator, class_name: 'User'

  before_validation :assign_duration

  validates :starts_at, :ends_at, presence: true
  validates :duration, numericality: { greater_than: 0 }
  validates :starts_at, :ends_at, overlap: { scope: 'user_id', query_options: { active: nil } }
  validate :validates_time, on: :user
  validate :validates_date

  scope :active, -> { where(active: true) }

  def assign_duration
    self.duration = ends_at - starts_at if ends_at && starts_at
  end

  def validates_date
    errors.add(:starts_at, :overlap_midnight) if starts_at && ends_at && starts_at.to_date != ends_at.to_date
  end

  def validates_time
    errors.add(:starts_at, :too_old) if starts_at && starts_at < 3.business_days.ago.beginning_of_day
  end
end
