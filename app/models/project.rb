# frozen_string_literal: true

class Project < ApplicationRecord
  has_many :user_roles, dependent: :destroy
  has_many :users, through: :user_roles
  has_many :metrics, dependent: :destroy
  has_many :work_times, dependent: :nullify
  has_one :external_auth, dependent: :destroy
  belongs_to :leader, class_name: 'User'

  validates :name, presence: true

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }

  def self.filter_by(action)
    case action
    when :active then where(active: true)
    when :inactive then where(active: false)
    else all
    end
  end
end
