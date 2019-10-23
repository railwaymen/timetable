# frozen_string_literal: true

require_relative 'querable'

class VacationApplicationsQuery
  include Querable

  def initialize(current_user, params = {})
    @start_date = params[:start_date]
    @end_date   = params[:end_date]
    @user_id = params[:user_id]
    @current_user = current_user
    @show_all = params[:show_all]
    @show_declined = params[:show_declined]
  end

  def accepted_or_declined_vacations
    @current_user.staff_manager? && @show_declined ? execute_sql(sanitized_sql(true, 'declined')) : execute_sql(sanitized_sql(true, 'accepted'))
  end

  def unconfirmed_vacations
    if @current_user.staff_manager?
      @show_all ? execute_sql(sanitized_sql(false, %w[declined unconfirmed approved accepted])) : execute_sql(sanitized_sql(false, 'approved'))
    else
      execute_sql(sanitized_sql(false, %w[unconfirmed approved]))
    end
  end

  private

  def sanitized_sql(accepted, status)
    sanitize_array [raw_sql(accepted), current_user: @current_user.id, status: status]
  end

  def date_filter
    if @start_date && @end_date
      sanitize_array(['AND ((v.start_date >= :start_date AND v.start_date <= :end_date) OR (v.end_date >= :start_date AND v.end_date <= :end_date) OR ((v.start_date::timestamp::date, v.end_date) OVERLAPS (:start_date, :end_date)))', start_date: @start_date.to_date.strftime('%Y/%m/%d'), end_date: @end_date.to_date.strftime('%Y/%m/%d')])
    elsif @start_date
      sanitize_array(['AND (v.start_date >= :start_date OR v.end_date >= :start_date OR ((v.start_date::timestamp::date, v.end_date) OVERLAPS (:start_date, :start_date)))', start_date: @start_date])
    elsif @end_date
      sanitize_array(['AND (v.start_date <= :end_date OR v.end_date <= :end_date OR ((v.start_date::timestamp::date, v.end_date) OVERLAPS (:end_date, :end_date)))', end_date: @end_date])
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

  def interacted_vacations(accepted)
    return if accepted || @current_user.staff_manager?

    [sanitize_array(['OR (v.status = ? AND vi.user_id = ?', 'declined', @current_user.id]), date_filter, user_filter, ')'].join(' ')
  end

  # rubocop:disable Metrics/MethodLength
  def raw_sql(accepted)
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
        ARRAY_TO_STRING(array_agg(us_apr.last_name || ' ' || us_apr.first_name), ',', '') AS approvers,
        (:current_user = ANY(array_agg(us_apr.id))) AS disable_approve_btn,
        ARRAY_TO_STRING(array_agg(us_dec.last_name || ' ' || us_dec.first_name), ',', '') AS decliners,
        (:current_user = ANY(array_agg(us_dec.id))) AS disable_decline_btn
      FROM vacations AS v
      LEFT JOIN users AS u ON u.id = v.user_id
      LEFT JOIN vacation_interactions AS vi ON vi.vacation_id = v.id
      LEFT JOIN users AS us_apr ON us_apr.id = vi.user_id AND vi.action = ANY(ARRAY['accepted', 'approved'])
      LEFT JOIN users AS us_dec ON us_dec.id = vi.user_id AND vi.action = 'declined'
      WHERE v.status IN (:status)
        #{date_filter}
        #{user_filter}
        #{vacation_type_filter(accepted)}
        #{interacted_vacations(accepted)}
      GROUP BY v.id, full_name, v.start_date, v.end_date, v.vacation_type, v.description, v.status
      ORDER BY v.start_date;
    )
  end
  # rubocop:enable Metrics/MethodLength
end
