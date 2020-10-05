# frozen_string_literal: true

require 'csv'

class CsvStaffGeneratorService
  include Querable

  Record = Struct.new(
    :contract_id,
    :user_name,
    :description,
    :start_date,
    :end_date,
    :created_at,
    :vacation_type,
    :vacation_sub_type,
    :status,
    :approvers
  )

  def initialize(params)
    @start_date = params[:start_date] ? params[:start_date].to_date.strftime('%Y/%m/%d') : nil
    @end_date = params[:end_date] ? params[:end_date].to_date.strftime('%Y/%m/%d') : nil
    @user_id = params[:user_id]
  end

  def generate
    CSV.generate(headers: true) do |csv|
      headers = ['Contract ID', 'Developer', 'Date From', 'Date To', 'Requested at', 'Status', 'Duration (days)', 'Description', 'Vacation Type', 'Vacation Code', 'Approved by']

      csv << headers

      records.each do |record|
        csv << prepare_row(record)
      end
    end
  end

  def filename
    if @user_id
      [
        records.first.user_name.downcase.tr(' ', '_'),
        @start_date, @end_date, 'vacations_report.csv'
      ].compact.join('_')
    else
      [@start_date, @end_date, 'vacations_report.csv'].compact.join('_')
    end
  end

  private

  # rubocop:disable Metrics/MethodLength
  def prepare_row(record)
    [
      record.contract_id,
      record.user_name,
      record.start_date,
      record.end_date,
      record.created_at.to_date,
      I18n.t("apps.staff.#{record.status}"),
      record.start_date.to_date.business_days_until(record.end_date.to_date + 1.day),
      record.description,
      I18n.t("common.#{record.vacation_type}"),
      format_vacation_type(record.vacation_type, record.vacation_sub_type),
      record.approvers
    ]
  end
  # rubocop:enable Metrics/MethodLength

  def format_vacation_type(type, sub_type)
    I18n.t("common.vacation_code.#{sub_type.nil? ? type : sub_type}")
  end

  def sanitized_sql
    sanitize_array([raw_sql])
  end

  def records
    @records ||= execute_sql(sanitized_sql).map(&method(:assign_record))
  end

  def assign_record(row)
    Record.new(*row.values)
  end

  def user_filter
    sanitize_array(['AND v.user_id = ?', @user_id.to_i]) if @user_id
  end

  def date_filter
    if @start_date && @end_date
      sanitize_array(['AND ((v.start_date >= :start_date AND v.start_date <= :end_date) OR (v.end_date >= :start_date AND v.end_date <= :end_date) OR ((v.start_date::timestamp::date, v.end_date) OVERLAPS (:start_date, :end_date)))', start_date: @start_date.to_date.iso8601, end_date: @end_date.to_date.iso8601])
    elsif @start_date
      sanitize_array(['AND (v.start_date >= :start_date OR v.end_date >= :start_date OR ((v.start_date::timestamp::date, v.end_date) OVERLAPS (:start_date, :start_date)))', start_date: @start_date.to_date.iso8601])
    elsif @end_date
      sanitize_array(['AND (v.start_date <= :end_date OR v.end_date <= :end_date OR ((v.start_date::timestamp::date, v.end_date) OVERLAPS (:end_date, :end_date)))', end_date: @end_date.to_date.iso8601])
    end
  end

  # rubocop:disable Metrics/MethodLength
  def raw_sql
    %(
      SELECT
        u.contract_name AS contract_id,
        (u.last_name || ' ' || u.first_name) AS user_name,
        v.description,
        v.start_date,
        v.end_date,
        v.created_at,
        v.vacation_type,
        v.vacation_sub_type,
        v.status,
        ARRAY_TO_STRING(ARRAY_AGG(us_apr.last_name || ' ' || us_apr.first_name), ', ', '') AS approvers
      FROM vacations AS v
      JOIN users AS u ON u.id = v.user_id
      LEFT JOIN vacation_interactions AS vi ON vi.vacation_id = v.id AND vi.action IN ('approved', 'accepted') AND v.status = 'accepted'
      LEFT JOIN users AS us_apr ON us_apr.id = vi.user_id
      WHERE u.discarded_at IS NULL
        #{date_filter}
        #{user_filter}
      GROUP BY v.id, u.id
      ORDER BY v.start_date;
    )
  end
end
# rubocop:enable Metrics/MethodLength
