# frozen_string_literal: true

class WorkTimeForm
  include ActiveModel::Model
  include ExternalValidatable

  attr_accessor :work_time

  delegate :id,
           :external_auth,
           :duration,
           :updated_by_admin,
           :project_id,
           :starts_at,
           :ends_at,
           :duration,
           :body,
           :task,
           :tag,
           :preview,
           :user_id,
           :user,
           :project,
           :date, to: :work_time

  def save(additional_params = {})
    return false unless valid?

    work_time.integration_payload = external_payload
    work_time.department = user.department
    work_time.body = work_time.external(:summary) if work_time.body.blank? && work_time.external(:summary).present?
    saved = work_time.save(additional_params)
    if saved
      update_external_auth if external_payload
    end
    saved
  end

  def valid?(*args)
    copy_errors(*args)
    super(*args) if errors.empty?
    errors.empty?
  end

  private

  def update_external_auth
    UpdateExternalAuthWorker.perform_async(work_time.project_id, work_time.external(:task_id), work_time.id) if work_time.external(:task_id)
  end

  def copy_errors(*args)
    errors.clear
    work_time.valid?(*args)
    work_time.errors.details.each do |key, value|
      errors.add(key, value.first[:error], value.first.except(:error))
    end
  end
end
