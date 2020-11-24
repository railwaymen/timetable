# frozen_string_literal: true

class Project < ApplicationRecord
  include Discard::Model
  include FilterConcern
  store_accessor :external_payload, :id, prefix: :external

  has_many :metrics, dependent: :destroy
  has_many :work_times, dependent: :nullify
  has_many :users, through: :work_times
  has_many :project_reports, dependent: :nullify
  has_one :external_auth, dependent: :destroy
  has_many :assignments, class_name: 'ProjectResourceAssignment', dependent: :destroy
  has_many :combined_reports, dependent: :nullify
  has_many :milestones, dependent: :nullify
  has_many :tags, dependent: :nullify
  belongs_to :leader, class_name: 'User'
  belongs_to :milestones_import_user, class_name: 'User'

  validates :name, presence: true
  validates :name, uniqueness: true
  validates :external_id, presence: true, if: :external_integration_enabled?

  scope :vacation, -> { where(vacation: true) }
  scope :booked, -> { where(booked: true) }

  after_save :change_events_color_and_name, if: proc { |project| project.saved_change_to_color? || project.saved_change_to_name? }

  def users_participating(range)
    User.where(id: work_times.select('distinct(user_id)').kept.where(starts_at: range))
  end

  def accounting?
    vacation? || booked?
  end

  def current_milestone
    milestones.select(&:opened?).select(&:starts_on).min_by(&:starts_on)
  end

  def change_events_color_and_name
    assignments.update_all(color: "##{color}", title: name) if assignments.any?
  end
end
