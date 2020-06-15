# frozen_string_literal: true

require_relative 'querable'

# rubocop:disable Metrics/ClassLength
class VacationApplicationsQuery
  include Querable

  def initialize(current_user, params = {})
    @start_date = params[:start_date]
    @end_date   = params[:end_date]
    @user_id = params[:user_id]
    @current_user = current_user
    @show_all = params[:show_all]
    @show_declined = params[:show_declined]
    @vacation_id = params[:id]
    @interacted_order_dir = params[:interacted_order]
    @waiting_order_dir = params[:waiting_order]
  end

  def accepted_or_declined_vacations
    @current_user.staff_manager? && @show_declined ? execute_sql(sanitized_sql(true, 'declined')) : execute_sql(sanitized_sql(true, 'accepted'))
  end

  def unconfirmed_vacations
    if @current_user.staff_manager?
      @show_all ? execute_sql(sanitized_sql(false, %w[unconfirmed approved])) : execute_sql(sanitized_sql(false, 'approved'))
    else
      execute_sql(sanitized_sql(false, %w[unconfirmed approved declined]))
    end
  end

  def vacation
    execute_sql(sanitize_array([vacation_sql, current_user: @current_user.id, vacation_id: @vacation_id]))
  end

  private

  def sanitized_sql(accepted, statuses)
    order_dir = %w[unconfirmed approved].any? { |status| statuses.include?(status) } ? @waiting_order_dir : @interacted_order_dir
    sanitize_array [raw_sql(accepted, order_dir), current_user: @current_user.id, statuses: statuses]
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

  def user_filter
    sanitize_array(['AND v.user_id = ?', @user_id.to_i]) if @user_id
  end

  def vacation_type_filter(accepted)
    return if accepted

    if @current_user.staff_manager?
      [sanitize_array(['OR (v.vacation_type = ? AND v.status IN (?)', 'others', %w[unconfirmed approved]]), date_filter, user_filter, ')'].join(' ')
    else
      sanitize_array(['AND v.vacation_type != ?', 'others'])
    end
  end

  # rubocop:disable Metrics/MethodLength
  def raw_sql(accepted, order_dir)
    %(
      SELECT
        v.id,
        v.user_id,
        (u.last_name || ' ' || u.first_name) AS full_name,
        v.start_date,
        v.end_date,
        v.vacation_type,
        v.vacation_sub_type,
        v.description,
        v.status,
        v.self_declined,
        ARRAY_TO_STRING(array_agg(us_apr.last_name || ' ' || us_apr.first_name), ',', '') AS approvers,
        ARRAY_TO_STRING(array_agg(us_dec.last_name || ' ' || us_dec.first_name), ',', '') AS decliners,
        (:current_user = ANY(array_agg(us.id))) AS interacted
      FROM vacations AS v
      LEFT JOIN users AS u ON u.id = v.user_id
      LEFT JOIN vacation_interactions AS vi ON vi.vacation_id = v.id
      LEFT JOIN users AS us ON us.id = vi.user_id AND vi.action = ANY(ARRAY['accepted', 'approved', 'declined'])
      LEFT JOIN users AS us_apr ON us_apr.id = vi.user_id AND vi.action = ANY(ARRAY['accepted', 'approved'])
      LEFT JOIN users AS us_dec ON us_dec.id = vi.user_id AND vi.action = 'declined'
      WHERE v.status IN (:statuses)
        #{date_filter}
        #{user_filter}
        #{vacation_type_filter(accepted)}
      GROUP BY v.id, full_name, v.start_date, v.end_date, v.vacation_type, v.description, v.status
      ORDER BY v.start_date #{order_dir};
    )
  end

  def vacation_sql
    %(
      SELECT
        v.id,
        v.user_id,
        (u.last_name || ' ' || u.first_name) AS full_name,
        v.start_date,
        v.end_date,
        v.vacation_type,
        v.vacation_sub_type,
        v.description,
        v.status,
        v.self_declined,
        ARRAY_TO_STRING(array_agg(us_apr.last_name || ' ' || us_apr.first_name), ',', '') AS approvers,
        ARRAY_TO_STRING(array_agg(us_dec.last_name || ' ' || us_dec.first_name), ',', '') AS decliners,
        (:current_user = ANY(array_agg(us.id))) AS interacted
      FROM vacations AS v
      LEFT JOIN users AS u ON u.id = v.user_id
      LEFT JOIN vacation_interactions AS vi ON vi.vacation_id = v.id
      LEFT JOIN users AS us ON us.id = vi.user_id AND vi.action = ANY(ARRAY['accepted', 'approved', 'declined'])
      LEFT JOIN users AS us_apr ON us_apr.id = vi.user_id AND vi.action = ANY(ARRAY['accepted', 'approved'])
      LEFT JOIN users AS us_dec ON us_dec.id = vi.user_id AND vi.action = 'declined'
      WHERE v.id = :vacation_id
      GROUP BY v.id, full_name, v.start_date, v.end_date, v.vacation_type, v.description, v.status
      ORDER BY v.start_date;
    )
  end
  # rubocop:enable Metrics/MethodLength
end
# rubocop:enable Metrics/ClassLength
