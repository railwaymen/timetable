# frozen_string_literal: true

class AccountingPeriod < ApplicationRecord
  belongs_to :user

  scope :full_time, -> { where(full_time: true) }
  scope :contract, -> { where(full_time: false) }

  validates :starts_at, :ends_at, presence: true, if: :full_time?
  validates :starts_at, :ends_at, overlap: { scope: 'user_id', query_options: { full_time: nil } }, if: -> { full_time? && starts_at && ends_at }
  validates :duration, presence: true, numericality: { greater_than: 0 }
  validates :position, presence: true, uniqueness: { scope: [:user_id] }
  validate :validates_starts_at_less_than_ends_at

  def contract?
    !full_time?
  end

  private

  def validates_starts_at_less_than_ends_at
    errors.add(:starts_at, :greater_than_ends_at) if starts_at && ends_at && starts_at >= ends_at
  end
end
