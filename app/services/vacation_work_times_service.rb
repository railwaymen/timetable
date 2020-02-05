# frozen_string_literal: true

class VacationWorkTimesService
  def initialize(vacation, current_user)
    @vacation = vacation
    @current_user = current_user
    @project = @vacation.illness? ? Project.find_by(name: 'ZKS') : Project.find_by(name: 'Vacation')
    @user = User.find(@vacation.user_id)
    @vacation_range = @vacation.start_date.business_dates_until(@vacation.end_date + 1.day)
  end

  def save
    return unless @current_user.staff_manager?

    work_time_dates = work_times.pluck(:starts_at).map { |date| date.strftime('%Y-%m-%d') }
    @vacation_range.each do |day|
      next if work_time_dates.include?(day.strftime('%Y-%m-%d'))

      work_time = WorkTimeForm.new(work_time: build_new_work_time(work_time_params(day)))
      work_time.save(@current_user.admin? ? {} : { context: :user }) # TODO: tylko admin?
    end
  end

  def work_times
    @work_times ||= @user.work_times.where('((starts_at::timestamp::date >= :start_date AND starts_at::timestamp::date <= :end_date) OR
                                            (ends_at::timestamp::date >= :start_date AND ends_at::timestamp::date <= :end_date)) AND work_times.active = :active',
                                           start_date: @vacation.start_date, end_date: @vacation.end_date, active: true)
  end

  private

  def work_time_params(day)
    {
      project_id: @project.id,
      user_id: @user.id,
      body: I18n.t("common.vacation_code.#{@vacation.vacation_sub_type || @vacation.vacation_type}"),
      starts_at: day.to_date.beginning_of_day + 9.hours,
      ends_at: day.to_date.beginning_of_day + 17.hours
    }
  end

  def build_new_work_time(params)
    WorkTime.new(params).tap do |work_time|
      # TODO: tylko admin?
      work_time.updated_by_admin = true if @current_user.admin?
      work_time.creator = @current_user
      work_time.vacation_id = @vacation.id
    end
  end
end
