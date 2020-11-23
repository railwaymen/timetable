# frozen_string_literal: true

class UpdateMilestoneForm
  ESTIAMTE_FIELDS = %i[dev_estimate qa_estimate ux_estimate pm_estimate other_estimate].freeze
  include ActiveModel::Model

  attr_accessor :milestone, :name, :closed, :estimate_change_note, :starts_on, :ends_on, :note, :active,
                :visible_on_reports, :dev_estimate, :qa_estimate, :ux_estimate, :pm_estimate, :other_estimate

  def initialize(attributes = {})
    super
    @attributes = attributes
  end

  def save
    milestone.assign_attributes(@attributes.slice(:name, :starts_on, :ends_on, :note, :closed, :visible_on_reports,
                                                  :dev_estimate, :qa_estimate, :ux_estimate, :pm_estimate, :other_estimate))
    return if milestone.invalid?

    build_estimate if milestone.any_estimate_changed?
    milestone.save
    active.is_a?(FalseClass) ? milestone.discard : milestone.undiscard
  end

  private

  def build_estimate
    values = {
      note: estimate_change_note, external_estimate: milestone.external_estimate
    }

    ESTIAMTE_FIELDS.each do |field|
      values[field] = send(field)
      values[[field, '_diff'].join] = send(field) - milestone.send([field, '_was'].join)
    end

    total = ESTIAMTE_FIELDS.map { |field| send(field) }.sum
    total_diff = total - milestone.total_estimate_was

    milestone.estimates.build(values.merge(total_estimate: total, total_estimate_diff: total_diff))
  end
end
