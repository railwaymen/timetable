# frozen_string_literal: true

module Reports
  class CsvRemoteWork
    def initialize(user_id:, from:, to:)
      @user_id = user_id
      @from = Time.zone.parse(from)
      @to = to.nil? ? DateTime.now.end_of_day.in_time_zone : to.to_datetime.end_of_day.in_time_zone
    end

    def generate
      CSV.generate do |csv|
        headers = %w[Day Remote]
        csv << headers

        records.each { |record| csv << record }
      end
    end

    def filename
      name = "#{@user.first_name}_#{@user.last_name}"

      [
        name,
        @from.strftime('%Y/%m/%d') + '-',
        @to.strftime('%Y/%m/%d'),
        'remote_work_report.csv'
      ].join('_')
    end

    private

    def user
      @user ||= User.find(@user_id)
    end

    def records
      work_times = user.work_times.where(starts_at: @from..@to, ends_at: @from..@to)
      work_times_by_day = work_times.group_by { |work_time| work_time.starts_at.to_date }.sort_by { |k, _| k }
      work_times_by_day.map do |day, work_times_in_day|
        [day, remote_work_status(work_times_in_day)]
      end
    end

    def remote_work_status(work_times_in_day)
      if work_times_in_day.all? { |work_time| work_time.office_work == false }
        'Y'
      elsif work_times_in_day.all? { |work_time| work_time.office_work == true }
        'N'
      elsif work_times_in_day.all? { |work_time| !work_time.office_work.nil? }
        'Y/N'
      else
        'NA'
      end
    end
  end
end
