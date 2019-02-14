# frozen_string_literal: true

class WorkTimeSaver
  attr_reader :work_time

  def initialize(work_time)
    @work_time = work_time
    @old_payload = @work_time.integration_payload
  end

  def call(additional_params = {})
    external_auth = work_time.project&.external_auth
    if external_auth.nil? || work_time.task.nil?
      return save_without_payload(additional_params)
    end

    if (payload = validate_integration(work_time, external_auth))
      save_with_payload(payload, additional_params)
    else
      InvalidWorkTime.new(work_time)
    end
  end

  private

  class InvalidWorkTime
    def initialize(work_time)
      @work_time = work_time
    end

    def valid?(*args)
      @work_time.valid?(*args)
      @work_time.errors.add(:task, I18n.t('activerecord.errors.models.work_time.attributes.task.invalid_external'))
      false
    end

    def method_missing(method, *arguments, &block)
      if @work_time.respond_to?(method)
        @work_time.send(method, *arguments, &block)
      else
        super
      end
    end

    def respond_to_missing?(method, include_private = false)
      @work_time.respond_to?(method, include_private) || super
    end
  end

  attr_reader :old_payload

  def validate_integration(work_time, _external_auth)
    auth = work_time.external_auth
    integration_payload = ExternalAuthStrategy.const_get(auth.provider).from_data(auth.data).integration_payload(work_time)
    if integration_payload.nil?
      nil
    else
      { auth.provider => integration_payload }
    end
  end

  def save_with_payload(payload, additional_params)
    work_time.integration_payload = payload
    saved = work_time.save(additional_params)
    update_external_auth if saved
    work_time
  end

  def save_without_payload(additional_params)
    work_time.integration_payload = nil
    work_time.save(additional_params)
    update_old_task
    work_time
  end

  def update_external_auth
    update_old_task
    UpdateExternalAuthWorker.perform_async(work_time.project_id, work_time.external_task_id) if work_time.external_task_id
  end

  def update_old_task
    return unless old_payload

    project_id = @work_time.saved_changes[:project_id] ? @work_time.saved_changes[:project_id][0] : @work_time.project_id
    old_payload.each_value do |v|
      UpdateExternalAuthWorker.perform_async(project_id, v['task_id'])
    end
  end
end
