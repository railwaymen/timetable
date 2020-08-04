# frozen_string_literal: true

class VacationWorkTimesService
  def initialize(vacation, current_user)
    @vacation = vacation
    @current_user = current_user
    @project = @vacation.vacation_project
    @user = User.find(@vacation.user_id)
    @vacation_range = @vacation.start_date.business_dates_until(@vacation.end_date + 1.day)
  end

  def save
    return unless @current_user.staff_manager?

    work_time_dates = work_times.pluck(:starts_at).map(&:to_date)
    @vacation_range.each do |day|
      next if work_time_dates.include?(day.to_date)

      work_time = WorkTimeForm.new(work_time: build_new_work_time(work_time_params(day)))
      work_time.save
    end
  end

  def work_times
<<<<<<< HEAD
    @work_times ||= @user.work_times.where('((starts_at BETWEEN :start_date AND :end_date) OR (ends_at BETWEEN :start_date AND :end_date)) AND work_times.discarded_at IS NULL',
                                           start_date: @vacation.start_date, end_date: @vacation.end_date)
=======
    @work_times ||= @user.work_times.where("((starts_at >= :start_date AND starts_at <= :end_date) OR
                                            (ends_at >= :start_date AND ends_at <= :end_date) OR
                                            ((starts_at, starts_at) OVERLAPS (:start_date, :end_date))) AND
                                            work_times.discarded_at IS NULL",
                                           start_date: @vacation.start_date.beginning_of_day, end_date: @vacation.end_date.end_of_day)
>>>>>>> Changed how work times are queried in VacationWorkTimeService
  end

  private

  def work_time_params(day)
    {
      project_id: @project.id,
      user_id: @user.id,
      body: I18n.t("common.vacation_code.#{@vacation.vacation_sub_type || @vacation.vacation_type}"),
      starts_at: day.to_date.beginning_of_day,
      ends_at: day.to_date.beginning_of_day + 8.hours
    }
  end

  def build_new_work_time(params)
    WorkTime.new(params).tap do |work_time|
      work_time.creator = @current_user
      work_time.vacation_id = @vacation.id
    end
  end
end
