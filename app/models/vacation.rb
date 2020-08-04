# frozen_string_literal: true

class Vacation < ApplicationRecord
  belongs_to :user
  has_many :vacation_interactions, dependent: :destroy
  has_many :work_times, dependent: :destroy
  has_many :assignments, class_name: 'ProjectResourceAssignment', dependent: :destroy

  validates :description, presence: true, if: :others?
  validates :vacation_sub_type, presence: true, if: :accepting_other_vacation, on: :update
  validates :start_date, :end_date, :vacation_type, :status, :user_id, presence: true
  validates :status, inclusion: { in: %w[unconfirmed declined approved accepted] }
  validates :vacation_type, inclusion: { in: %w[planned requested compassionate others] }
  validates :vacation_sub_type, inclusion: { in: %w[paternity parental upbringing unpaid rehabilitation illness care] }, allow_nil: true
  validate :validates_start_date_less_than_end_date
  validate :validates_work_time, if: :unconfirmed?, on: :create

  enum status: { unconfirmed: 'unconfirmed', declined: 'declined', approved: 'approved', accepted: 'accepted' }
  enum vacation_type: { planned: 'planned', requested: 'requested', compassionate: 'compassionate', others: 'others' }
  enum vacation_sub_type: { paternity: 'paternity', parental: 'parental', upbringing: 'upbringing', unpaid: 'unpaid',
                            rehabilitation: 'rehabilitation', illness: 'illness', care: 'care' }

  scope :current_year, -> { where("date_part('year', start_date) = ?", Time.current.year) }

  def validates_start_date_less_than_end_date
    errors.add(:start_date, :greater_than_end_date) if start_date && end_date && start_date > end_date
  end

  def validates_work_time
    return unless user

    work_times = WorkTime.where('((starts_at::timestamp::date >= :start_date AND starts_at::timestamp::date <= :end_date) OR
                                    (ends_at::timestamp::date >= :start_date AND ends_at::timestamp::date <= :end_date) OR
                                    ((starts_at::timestamp::date, starts_at::timestamp::date) OVERLAPS (:start_date, :end_date))) AND
                                    discarded_at IS NULL AND user_id = :user_id', start_date: start_date, end_date: end_date, user_id: user_id)
    return if work_times.blank?

    vacation_ids = work_times.pluck(:vacation_id).uniq
    errors.add(:base, :vacation_exists) if vacation_ids.any? { |x| x.is_a?(Numeric) }
    errors.add(:base, :work_time_exists) if vacation_ids.include?(nil)
  end

  def accepting_other_vacation
    others? && accepted?
  end

  def user_full_name
    user.to_s
  end

  def vacation_project
    if planned? || requested? || compassionate? || unpaid? || care?
      Project.find_by!(name: 'Vacation')
    else
      Project.find_by!(name: 'ZKS')
    end
  end
end
