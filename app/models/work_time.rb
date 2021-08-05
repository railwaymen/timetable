# frozen_string_literal: true

class WorkTime < ApplicationRecord
  include Discard::Model

  has_paper_trail ignore: [:department]
  belongs_to :project
  belongs_to :user
  belongs_to :creator, class_name: 'User'
  belongs_to :vacation
  belongs_to :tag

  before_validation :assign_duration
  before_save :delete_spaces, :assign_date

  validates :project_id, :tag_id, :starts_at, :ends_at, presence: true
  validates :duration, numericality: { greater_than: 0 }, unless: :project_zero?
  validates :starts_at, :ends_at, overlap: { scope: 'user_id', query_options: { kept: nil }, exclude_edges: %i[starts_at ends_at] }
  validate :validates_time, on: :user
  validate :validates_date
  validate :validates_body

  delegate :external_auth, to: :user

  def delete_spaces
    self.task = task.strip if task
  end

  def assign_date
    self.date = starts_at.to_date
  end

  def project_zero?
    project.try(:count_duration?) == false
  end

  def assign_duration
    self.duration = if project_zero?
                      0
                    elsif ends_at && starts_at
                      ends_at - starts_at
                    end
  end

  def body_optional?
    project.try(:lunch?) || project.try(:autofill?)
  end

  def validates_date
    errors.add(:starts_at, :overlap_midnight) if starts_at && ends_at && starts_at.to_date != ends_at.to_date
  end

  def validates_time
    errors.add(:starts_at, :too_old) if (starts_at && ends_at && (starts_at < 3.business_days.ago.beginning_of_day || ends_at < 3.business_days.ago.beginning_of_day)) ||
                                        (starts_at_was && ends_at_was && (starts_at_was < 3.business_days.ago.beginning_of_day || ends_at_was < 3.business_days.ago.beginning_of_day))
  end

  def validates_body
    errors.add(:body, :body_or_task_blank) if (body.presence.nil? && task.presence.nil?) && !body_optional?
  end

  def external(name)
    integration_payload&.dig(external_auth&.provider, name.to_s)
  end

  def jira_task_id
    integration_payload&.dig('Jira', 'task_id')
  end
end
