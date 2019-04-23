# frozen_string_literal: true

class ProjectReportCreator
  NotAllUsersHaveRole = Class.new(StandardError)

  def call(project_report, report_roles)
    work_times = get_work_times(project_report)
    user_role_map = Hash[report_roles.map { |role| [role[:id], role[:role]] }]
    raise NotAllUsersHaveRole, 'Not all users have a role' unless all_users_have_role?(work_times, user_role_map)

    project_report.initial_body = project_report.last_body = generate_body(work_times, user_role_map)
    project_report.assign_attributes(
      project_report_roles_attributes: report_roles.map(&method(:transform_param)),
      duration_sum:  work_times.inject(0) { |sum, wt| sum + wt.duration }
    )
    project_report.tap(&:save!)
  end

  private

  def all_users_have_role?(work_times, user_role_map)
    Set.new(user_role_map.map { |user_id, role| user_id.to_i if role.present? }.compact) == Set.new(work_times.map(&:user_id))
  end

  def get_work_times(project_report)
    project_report.project.work_times.active
                  .joins(:user)
                  .where('work_times.starts_at BETWEEN ? AND ?', project_report.range_start, project_report.range_end)
                  .group('user_id, users.last_name, users.first_name, task, body')
                  .select("user_id, CONCAT(users.first_name, ' ', users.last_name) AS owner, SUM(duration) AS duration, CASE WHEN coalesce(task, '') = '' THEN body ELSE task END as task")
  end

  def generate_body(work_times, user_role_map)
    Hash[
      work_times.group_by { |work_time| user_role_map[work_time.user_id] }.tap do |body|
        body.transform_values! do |wts|
          wts.map { |wt| { owner: wt.owner, task: wt.task, duration: wt.duration } }
        end
      end.sort_by(&:first) # compare only keys
    ] # Keep keys in hash sorted alphabetically
  end

  def transform_param(param)
    param.tap do
      param.permit!
      param['user_id'] = param.delete('id')
      param.delete(:first_name)
      param.delete(:last_name)
    end
  end
end
