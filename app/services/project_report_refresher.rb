# frozen_string_literal: true

class ProjectReportRefresher
  def initialize(project_report_id:, user_id:)
    @project_report = ProjectReport.find(project_report_id)
    @user = User.find(user_id)
    @cached_tasks = {}
  end

  def call
    update_last_body
    @project_report.assign_attributes(refresh_status: :done, refreshed_at: Time.current)
    @project_report.save!
  rescue StandardError => e
    @project_report.update!(refresh_status: :error)
    raise e
  end

  private

  def update_last_body
    @project_report.last_body.each do |_role, work_times|
      work_times.each do |work_time|
        next if work_time['integration_payload'].nil?

        work_time['integration_payload'].each do |provider, _payload|
          work_time['integration_payload'][provider] = refresh_integration_payload(work_time, provider)
        end
      end
    end
  end

  def refresh_integration_payload(work_time, provider)
    raise 'Incorrect provider' if provider.present? && provider != @user.external_auth.provider

    task = work_time['task']
    return @cached_tasks[task] if @cached_tasks.key?(task)

    external_auth = ExternalAuthStrategy.const_get(@user.external_auth.provider).from_data(@user.external_auth.data)

    new_payload = external_auth.integration_payload(task)
    raise "Refresh from provider #{provider} failed, task: #{task}" if new_payload.blank?

    @cached_tasks[task] = new_payload
    new_payload
  end
end
