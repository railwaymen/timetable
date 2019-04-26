# frozen_string_literal: true

class ProjectReport < ApplicationRecord
  enum state: { editing: 'editing', done: 'done' }

  belongs_to :project
  has_many :project_report_roles, dependent: :nullify
  accepts_nested_attributes_for :project_report_roles

  validates :project, presence: true
  validates :initial_body, presence: true
  validates :last_body, presence: true
  validate :body_did_not_lost_duration, on: :update
  validate :body_did_not_change_cost

  private

  def body_did_not_lost_duration
    sum = last_body.inject(0) do |acc, (_, value)|
      acc + value.sum { |wt| wt['duration'].to_i }
    end

    errors.add(:last_body, 'Changed duration sum') if sum != duration_sum
  end

  def body_did_not_change_cost
    sum = last_body.inject(0.to_r) do |acc, (_, value)|
      acc + value.sum { |wt| wt['cost'].to_r }
    end.round(2).to_f
    errors.add(:last_body, 'Changed cost') if sum != cost.round(2)
  end
end
