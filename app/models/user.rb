class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable,
         :rememberable, :trackable, :validatable

  devise :recoverable unless Rails.application.secrets.ldap[:enabled]

  has_many :work_times, dependent: :destroy
  has_many :accounting_periods, dependent: :destroy
  has_many :accounting_periods_recounts
  has_many :projects, foreign_key: :leader_id
  validates :first_name, :last_name, presence: true

  scope :active, -> { where(active: true) }

  def self.filter_by(action)
    case action
    when :active then where(active: true)
    when :inactive then where(active: false)
    else all
    end
  end

  def active_for_authentication?
    super && active?
  end

  def password_required?
    new_record? ? false : super
  end

  def leader?
    project_ids.any?
  end

  def to_s
    [first_name, last_name].join(' ')
  end

  def as_json(_options = {})
    {
      id: id,
      first_name: first_name,
      last_name: last_name,
      is_leader: leader?,
      admin: admin,
      manager: manager
    }
  end

  def destroy
    update(active: false)
    self
  end
end
