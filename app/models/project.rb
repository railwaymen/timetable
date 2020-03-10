# frozen_string_literal: true

class Project < ApplicationRecord
  has_many :metrics, dependent: :destroy
  has_many :work_times, dependent: :nullify
  has_many :users, through: :work_times
  has_many :project_reports, dependent: :nullify
  has_one :external_auth, dependent: :destroy
  has_many :events, dependent: :destroy
  belongs_to :leader, class_name: 'User'
  
  validates :name, presence: true
  validates :name, uniqueness: true
  
  after_save :change_events_color_and_name, if: proc { |project| project.saved_change_to_color? || project.saved_change_to_name? }

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }

  def self.filter_by(action)
    case action
    when :active then where(active: true)
    when :inactive then where(active: false)
    else all
    end
  end

  def users_participating(range)
    users.joins(:work_times).merge(WorkTime.active).where(work_times: { starts_at: range })
  end

  def taggable?
    !(lunch || vacation? || zks? || name == 'Księgowość')
  end

  def vacation?
    name == 'Vacation'
  end

  def zks?
    name == 'ZKS'
  end

  def change_events_color_and_name
    events.update(color: "##{color}", title: name) if events.any?
  end
end
