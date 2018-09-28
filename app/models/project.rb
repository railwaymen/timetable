class Project < ApplicationRecord
  has_many :user_roles
  has_many :users, through: :user_roles
  has_many :metrics
  has_many :work_times
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
