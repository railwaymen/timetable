# frozen_string_literal: true

module Reports
  class CsvGeneratorService
    include Querable

    Record = Struct.new(:user_name, :task, :body, :duration, :starts_at, :user_id, :task_sum, :user_sum)

    def initialize(params:, user:, project:)
      @params    = params
      @project   = project
      @user      = user
      @from      = Time.zone.parse(params[:from])
      @to        = Time.zone.parse(params[:to])
      @parameter = params.key?(:user_id) ? params[:user_id] : params[:id]
    end

    # rubocop:disable Metrics/MethodLength, Style/Next, Metrics/BlockLength

    def generate
      CSV.generate(headers: true) do |csv|
        headers = (@params.key?(:user_id) ? %w[Date Description Duration] : %w[Developer Date Description Duration])
        array_position = @params.key?(:user_id) ? 1 : 2
        headers.insert(array_position, 'Task URL') if @project&.work_times_allows_task?

        csv << headers

        records.each_with_index do |record, index|
          next_record = records[index + 1] if index + 1 < records.to_a.size
          row = [
            record.starts_at.to_date,
            record.body,
            format_duration(record.duration)
          ]
          row.unshift(record.user_name) unless @params.key?(:user_id)
          row.insert(array_position, record.task) if @project&.work_times_allows_task?
          csv << row
          if record.task.present? && (next_record.nil? || record.task != next_record.task) && record.duration != record.task_sum
            row = [
              nil,
              nil,
              format_duration(record.task_sum)
            ]
            row.unshift(record.user_name) unless @params.key?(:user_id)
            row.insert(2, nil) if @project&.work_times_allows_task?
            csv << row
          end

          if next_record.nil? || record.user_id != next_record.user_id
            row = [
              'Developer Total',
              nil,
              format_duration(record.user_sum)
            ]
            row.insert(2, nil) if @project&.work_times_allows_task?
            row.insert(1, nil) unless @params.key?(:user_id)
            csv << row
          end
        end
      end
    end

    # rubocop:enable Metrics/MethodLength, Style/Next, Metrics/BlockLength

    def filename
      name = @params[:user_id] ? "#{@user.first_name}_#{@user.last_name}" : @project.name.underscore
      [
        name,
        @from.strftime('%Y/%m/%d'),
        @to.strftime('%Y/%m/%d'),
        'work_times_report.csv'
      ].join('_')
    end

    private

    def format_duration(duration)
      duration = duration.to_f
      h = (duration / 3600).to_i
      m = ((duration % 3600) / 60).to_i
      m = "0#{m}" if m < 10
      h = "0#{h}" if h < 10
      "#{h}:#{m}"
    end

    def sanitized_sql
      sanitize_array([raw_sql, @parameter, @from, @to])
    end

    def records
      @records ||= execute_sql(sanitized_sql).map(&method(:assign_record))
    end

    def assign_record(row)
      Record.new(*row.values)
    end

    def by_what
      @params.key?(:user_id) ? 'u.id' : 'project_id'
    end

    def projects_access
      sanitize_array(['AND w.project_id IN (?)', @user.project_ids]) unless @user.admin? || @user.manager?
    end

    def raw_sql
      %(
        SELECT
          (u.first_name || ' ' || u.last_name) as user_name, task, body, duration, starts_at, u.id as user_id,
          SUM(duration) OVER (partition by u.id, task ORDER BY task) AS task_sum,
          SUM(duration) OVER (partition by u.id ORDER BY task) AS user_sum
        FROM work_times w JOIN users u on w.user_id = u.id
        WHERE w.active = 't' AND #{by_what} = ? AND w.starts_at >= ? AND w.ends_at <= ? #{projects_access}
        ORDER BY user_name, task
      )
    end
  end
end
