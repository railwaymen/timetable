# frozen_string_literal: true

class ProjectReport < ApplicationRecord
  enum state: { selecting_roles: 'selecting_roles', editing: 'editing', done: 'done' }

  belongs_to :project
  has_many :project_report_roles, dependent: :nullify
  accepts_nested_attributes_for :project_report_roles

  validates :project, presence: true
  validates :initial_body, presence: true
  validates :last_body, presence: true
  validate :body_did_not_lost_duration, on: :update

  private

  def body_did_not_lost_duration
    sum = last_body.inject(0) do |acc, (_, value)|
      acc + value.sum { |wt| wt['duration'].to_i }
    end

    errors.add(:last_body, 'Changed duration sum') if sum != duration_sum
  end
end
