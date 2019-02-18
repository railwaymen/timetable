# frozen_string_literal: true

class WorkTimeForm
  include ActiveModel::Model

  attr_reader :work_time
  attr_reader :old_payload
  validate :validate_integration

  delegate :id,
           :duration,
           :updated_by_admin,
           :project_id,
           :starts_at,
           :ends_at,
           :duration,
           :body,
           :task,
           :preview,
           :user_id,
           :project,
           :date, to: :work_time

  def save(additional_params = {})
    return false unless valid?

    work_time.integration_payload = @external_payload
    saved = work_time.save(additional_params)
    if saved
      update_external_auth if @external_payload
      update_old_task if old_payload
    end
    saved
  end

  def valid?(*args)
    copy_errors(*args)
    super(*args) if errors.empty?
    errors.empty?
  end

  def work_time=(work_time)
    @work_time = work_time
    @old_payload = @work_time&.integration_payload
  end

  private

  def validate_integration
    return nil if work_time.external_auth.nil? || work_time.task.blank?

    fetch_external_payload unless defined?(@external_payload)
    return unless @external_payload.nil?

    errors.add(:task, I18n.t('activerecord.errors.models.work_time.attributes.task.invalid_external'))
  end

  def update_external_auth
    UpdateExternalAuthWorker.perform_async(work_time.project_id, work_time.external_task_id) if work_time.external_task_id
  end

  def update_old_task
    return if old_payload.blank?

    project_id = work_time.saved_changes[:project_id] ? @work_time.saved_changes[:project_id][0] : @work_time.project_id
    old_payload.each_value do |v|
      UpdateExternalAuthWorker.perform_async(project_id, v['task_id'])
    end
  end

  def fetch_external_payload
    auth = @work_time.external_auth
    return @external_payload = nil if auth.nil? || work_time.task.nil?

    integration_payload = ExternalAuthStrategy.const_get(auth.provider).from_data(auth.data).integration_payload(work_time)
    @external_payload = if integration_payload.nil?
                          nil
                        else
                          { auth.provider => integration_payload }
                        end
  end

  def copy_errors(*args)
    work_time.valid?(*args)
    work_time.errors.details.each do |key, value|
      errors.add(key, value.first[:error])
    end
  end
end
