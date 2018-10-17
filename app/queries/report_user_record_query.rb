# frozen_string_literal: true

class ReportUserRecordQuery
  def initialize(from:, to:, user:, action: :self)
    @from   = from
    @to     = to
    @user   = user
    @action = (action || :self).to_sym
  end

  def results
    @results ||= ActiveRecord::Base.connection.execute(sanitized_sql).map(&method(:assign_to_class))
  end

  private

  def valid_actions
    if @user.admin? || @user.manager? then %i[self all leader]
    elsif @user.leader? then %i[self leader]
    else %i[self]
    end
  end

  def assign_to_class(row)
    ReportUserRecord.new(row.symbolize_keys)
  end

  def sanitized_sql
    ActiveRecord::Base.send :sanitize_sql_array, [raw, @from, @to]
  end

  def projects_access
    case @action.presence_in(valid_actions)
    when :all    then ''
    when :leader then leader_access
    when :self   then user_access
    else user_access
    end
  end

  def user_access
    ActiveRecord::Base.send(:sanitize_sql_array, ['AND work_times.user_id = ?', @user.id])
  end

  def leader_access
    ActiveRecord::Base.send(:sanitize_sql_array, ['AND projects.id IN (?)', @user.project_ids])
  end

  # rubocop:disable Metrics/MethodLength
  def raw
    %(
      SELECT DISTINCT
        CONCAT(users.last_name, ' ', users.first_name) AS user_name,
        projects.id AS project_id,
        users.id AS user_id,
        projects.name AS project_name,
        projects.internal,
        users.last_name,
        SUM(duration) OVER(PARTITION BY projects.id, users.id) AS time_worked,
        SUM(duration) OVER(PARTITION BY users.id) AS user_work_time
      FROM projects
      INNER JOIN work_times ON work_times.project_id = projects.id
      INNER JOIN users ON users.id = work_times.user_id
      WHERE work_times.starts_at >= ?
        AND work_times.ends_at <= ?
        AND work_times.active = 't'
        #{projects_access}
      ORDER BY last_name ASC, projects.internal ASC, time_worked DESC
    )
  end
  # rubocop:enable Metrics/MethodLength
end
