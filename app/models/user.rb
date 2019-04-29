# frozen_string_literal: true

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable,
         :rememberable, :trackable, :validatable

  devise :recoverable unless Rails.application.secrets.ldap[:enabled]

  has_many :work_times, dependent: :destroy
  has_many :accounting_periods, dependent: :destroy
  has_many :accounting_periods_recounts, dependent: :destroy
  has_many :projects, foreign_key: :leader_id, dependent: :nullify, inverse_of: :leader
  validates :first_name, :last_name, presence: true

  scope :active, -> { where(active: true) }

  # rubocop:disable MethodLength
  def self.with_next_and_previous_user_id
    from(%(
      (
        SELECT
          users.*,
          LAG(users.id) OVER(ORDER BY contract_name ASC) AS prev_id,
          LEAD(users.id) OVER(ORDER BY contract_name ASC) AS next_id
        FROM users
        WHERE active IS TRUE
        ORDER BY contract_name ASC
      ) users
    ))
  end
  # rubocop:enable MethodLength

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
    [last_name, first_name].join(' ')
  end

  def as_json(_options = {})
    {
      id: id,
      first_name: first_name,
      last_name: last_name,
      projects: project_ids,
      is_leader: leader?,
      admin: admin,
      manager: manager,
      lang: lang
    }
  end

  def destroy
    update(active: false)
    self
  end
end
