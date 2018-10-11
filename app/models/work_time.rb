class WorkTime < ApplicationRecord
  has_paper_trail skip: [:contract_name]
  belongs_to :project
  belongs_to :user
  belongs_to :creator, class_name: 'User'

  before_validation :assign_duration
  before_create :assign_date
  before_save :delete_spaces

  validates :project_id, :starts_at, :ends_at, presence: true
  validates :project_id, :starts_at, :ends_at, presence: true
  validates :duration, numericality: { greater_than: 0 }, unless: :project_zero?
  validates :starts_at, :ends_at, overlap: { scope: 'user_id', query_options: { active: nil }, exclude_edges: %i[starts_at ends_at] }
  validate :validates_time, on: :user
  validate :validates_date
  validate :validates_ends_at
  validate :validates_body
  validate :task_url

  scope :active, -> { where(active: true) }

  def delete_spaces
    self.task = task.strip if task
  end

  def project_zero?
    project.try(:count_duration?) == false
  end

  def task_url
    return if task.blank?

    URI.parse(task)
  rescue URI::InvalidURIError
    errors.add(:task, I18n.t('activerecord.errors.models.work_time.attributes.task.invalid_uri'))
  end

  def assign_duration
    self.duration = if project_zero?
                      0
                    else
                      ends_at - starts_at
                    end
  end

  def body_optional?
    project.try(:lunch?) || project.try(:autofill?)
  end

  def assign_date
    self.date = starts_at.to_date
  end

  def validates_date
    errors.add(:base, I18n.t('activerecord.errors.models.work_time.base.validates_date')) if starts_at.to_date != ends_at.to_date
  end

  def validates_ends_at
    errors.add(:ends_at, I18n.t('activerecord.errors.models.work_time.attributes.ends_at.validates_ends_at')) if starts_at && starts_at > 1.month.from_now
  end

  def validates_time
    errors.add(:base, I18n.t('activerecord.errors.models.work_time.base.validates_time')) if starts_at < 3.business_days.ago.beginning_of_day || ends_at < 3.business_days.ago.beginning_of_day
  end

  def validates_body
    errors.add(:base, I18n.t('activerecord.errors.models.work_time.base.validates_body')) if (body.presence.nil? && task.presence.nil?) && !body_optional?
  end
end
