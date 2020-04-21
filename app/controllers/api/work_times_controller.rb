# frozen_string_literal: true

module Api
  # rubocop:disable Metrics/ClassLength
  # rubocop:disable Metrics/MethodLength
  class WorkTimesController < Api::BaseController
    def index
      @work_times = WorkTime.kept.includes(:project).order(starts_at: :desc).where(permitted_search_params)

      respond_with @work_times
    end

    def show
      @work_time = find_work_time
      @work_time_duration = current_user.work_times.kept.where(task: @work_time.task).sum(:duration)

      respond_with @work_time
    end

    def create
      @work_time = WorkTimeForm.new(work_time: build_new_work_time)
      @work_time.save(work_hours_save_params)
      increase_work_time(@work_time, @work_time.duration) if @work_time.valid?(context)
      respond_with @work_time
    end

    def create_filling_gaps
      @work_time = WorkTimeFillGapsForm.new(work_time: build_new_work_time)
      saved = @work_time.save(work_hours_save_params)
      increase_work_time(@work_time, @work_time.saved.sum(&:duration)) if saved
      respond_with @work_time
    end

    def update
      @work_time = find_work_time
      @work_time.assign_attributes(work_time_params)
      duration_was = @work_time.duration
      if current_user.admin? && @work_time.changed?
        @work_time.updated_by_admin = true if @work_time.user_id != current_user.id
      end
      @work_time = WorkTimeForm.new(work_time: @work_time)
      @work_time.save(work_hours_save_params)
      increase_or_decrease_work_time(@work_time, duration_was) if @work_time.valid?(context)
      respond_with @work_time
    end

    def destroy
      @work_time = find_work_time
      @work_time.assign_attributes(updated_by_admin: true) if @work_time.user_id != current_user.id
      @work_time.assign_attributes(discarded_at: Time.zone.now)
      @work_time.save(work_hours_save_params)
      UpdateExternalAuthWorker.perform_async(@work_time.project_id, @work_time.external_task_id, @work_time.id) if @work_time.external_task_id
      decrease_work_time(@work_time, @work_time.duration)
      respond_with @work_time
    end

    private

    def context
      :user unless current_user.admin?
    end

    def work_hours_save_params
      current_user.admin? ? {} : { context: :user }
    end

    def build_new_work_time
      if current_user.admin?
        WorkTime.new(work_time_create_params).tap do |work_time|
          work_time.updated_by_admin = true if work_time.user_id != current_user.id
          work_time.user_id = work_time_create_params[:user_id] || current_user.id
          work_time.creator = current_user
        end
      else
        current_user.work_times.build(work_time_params).tap do |work_time|
          work_time.creator = current_user
        end
      end
    end

    def permitted_search_params
      if current_user.admin? || current_user.manager?
        {
          project_id: params[:project_id].presence,
          starts_at: (Time.zone.parse(params[:from])..Time.zone.parse(params[:to]) if params[:from] && params[:to]),
          user_id: params[:user_id].presence || current_user.id
        }
      elsif current_user.leader?
        filter_id = (params[:user_id].presence || current_user.id).to_i
        filter_project_id = filter_id == current_user.id ? params[:project_id] : (params[:project_id].to_i.presence_in(current_user.projects.pluck(:id)) || 0)

        {
          project_id: filter_project_id.presence,
          starts_at: (Time.zone.parse(params[:from])..Time.zone.parse(params[:to]) if params[:from].present? && params[:to].present?),
          user_id: filter_id
        }
      else
        {
          project_id: params[:project_id].presence,
          starts_at: (Time.zone.parse(params[:from])..Time.zone.parse(params[:to]) if params[:from].present? && params[:to].present?),
          user_id: current_user.id
        }
      end.delete_if { |_key, value| value.nil? }
    end

    def increase_or_decrease_work_time(work_time, duration_was)
      if work_time.duration > duration_was
        increase_work_time(work_time, work_time.duration - duration_was)
      elsif work_time.duration < duration_was
        decrease_work_time(work_time, duration_was - work_time.duration)
      end
    end

    def increase_work_time(work_time, duration)
      IncreaseWorkTimeWorker.perform_async(user_id: work_time.user_id, duration: duration, starts_at: work_time.starts_at, ends_at: work_time.ends_at, date: work_time.starts_at.to_date)
    end

    def decrease_work_time(work_time, duration)
      DecreaseWorkTimeWorker.perform_async(duration: duration, date: work_time.starts_at.to_date, user_id: work_time.user_id)
    end

    def find_work_time
      if current_user.admin?
        WorkTime.kept.find(params[:id])
      else
        current_user.work_times.kept.find(params[:id])
      end
    end

    def work_time_create_params
      params.require(:work_time)
            .permit(
              %i[
                project_id
                user_id
                body
                task
                tag
                starts_at
                ends_at
              ]
            )
    end

    def work_time_params
      params.require(:work_time)
            .permit(
              %i[
                project_id
                body
                task
                tag
                starts_at
                ends_at
              ]
            )
    end
  end
  # rubocop:enable Metrics/MethodLength
  # rubocop:enable Metrics/ClassLength
end
