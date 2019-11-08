# frozen_string_literal: true

class VacationInteraction < ApplicationRecord
  belongs_to :user
  belongs_to :vacation

  enum action: { declined: 'declined', approved: 'approved', accepted: 'accepted' }

  validates :vacation_id, :user_id, :action, presence: true
  validates :action, inclusion: { in: %w[declined approved accepted] }

  validate :validate_uniqueness

  def validate_uniqueness
    return unless VacationInteraction.where(vacation_id: vacation_id, user_id: user_id, action: action).any?

    errors.add(:base, I18n.t('activerecord.errors.models.vacation_interaction.base.already_interacted', action: I18n.t("apps.staff.#{action}").downcase))
  end
end
