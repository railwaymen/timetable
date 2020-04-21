# frozen_string_literal: true

module Reports
  class CsvDateRangeGeneratorService
    include Querable

    Record = Struct.new(
      :contract_id,
      :user_name,
      :project_id,
      :duration,
      :starts_at,
      :ends_at,
      :body,
      :user_id
    )

    def initialize(params:, user:, project:)
      @params    = params
      @project   = project
      @user      = user
      @from      = Time.zone.parse(params[:from])
      @to        = Time.zone.parse(params[:to])
    end

    # rubocop:disable Metrics/MethodLength
    def generate
      CSV.generate(headers: true) do |csv|
        headers = ['Contract ID', 'Developer', 'Date From', 'Date To', 'Description', 'Duration(Days)']

        csv << headers

        project_id = @params[:id].to_i
        temp_rows = []

        records.each_with_index do |record, index|
          next_record = records[index + 1] if index + 1 < records.to_a.size

          temp_rows << record if record.project_id == project_id

          unless (next_record&.project_id != project_id ||
                  next_record&.user_id != record.user_id) && !temp_rows.empty?
            next
          end

          csv << prepare_row(temp_rows, record)
          temp_rows = []
        end
      end
    end
    # rubocop:enable Metrics/MethodLength

    def filename
      [
        @project.name.underscore,
        @from.strftime('%Y/%m/%d'),
        @to.strftime('%Y/%m/%d'),
        'work_times_report.csv'
      ].join('_')
    end

    private

    def prepare_row(temp_rows, record)
      [
        record.contract_id,
        record.user_name,
        temp_rows.first.starts_at.to_date,
        temp_rows.last.ends_at.to_date,
        temp_rows.first.body || temp_rows.last.body,
        format_duration(
          temp_rows.reduce(0) { |sum, tr| sum + tr.duration }
        )
      ]
    end

    def format_duration(duration)
      (duration.to_f / (1.hour * 8)).to_i
    end

    def sanitized_sql
      sanitize_array([raw_sql, @from, @to])
    end

    def records
      @records ||= execute_sql(sanitized_sql).map(&method(:assign_record))
    end

    def assign_record(row)
      Record.new(*row.values)
    end

    def raw_sql
      %(
        SELECT
          u.contract_name as contract_id,
          (u.last_name || ' ' || u.first_name) as user_name, project_id,
            duration, starts_at, ends_at, body, u.id as user_id
        FROM work_times w JOIN users u on w.user_id = u.id
        WHERE w.discarded_at IS NULL AND w.starts_at >= ? AND w.ends_at <= ?
        ORDER BY user_name, starts_at
      )
    end
  end
end
