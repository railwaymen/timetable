# frozen_string_literal: true

class VacationPeriod < ApplicationRecord
  belongs_to :user

  validates :user_id, :starts_at, :ends_at, :vacation_days, presence: true
  validates :closed, inclusion: { in: [true, false] }
  validates :vacation_days, numericality: { only_integer: true }
  validates :user_id, uniqueness: { scope: %i[starts_at ends_at], message: I18n.t('activerecord.errors.models.vacation_period.attributes.user_id.validates_uniqueness') }
end
