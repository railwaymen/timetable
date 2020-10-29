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

    @vacation_range.each do |day|
      work_time = WorkTimeForm.new(work_time: build_new_work_time(work_time_params(day)))
      return false unless work_time.save
    end
  end

  def work_times
    @work_times ||= Vacations::WorkTimesIn.new(@vacation.start_date, @vacation.end_date, @user).perform
  end

  private

  def work_time_params(day)
    {
      project_id: @project.id,
      user_id: @user.id,
      body: I18n.t("common.vacation_code.#{@vacation.vacation_sub_type || @vacation.vacation_type}"),
      starts_at: day.to_date.beginning_of_day,
      ends_at: day.to_date.beginning_of_day + 8.hours,
      tag: default_tag
    }
  end

  def default_tag
    @default_tag ||= Tag.where(use_as_default: true).first!
  end

  def build_new_work_time(params)
    WorkTime.new(params).tap do |work_time|
      work_time.creator = @current_user
      work_time.vacation_id = @vacation.id
    end
  end
end
