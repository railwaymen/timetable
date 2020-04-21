# frozen_string_literal: true

class WorkTimeFillGapsForm
  include ActiveModel::Model
  include ExternalValidatable

  attr_reader :work_time
  attr_reader :saved

  delegate :id,
           :external_auth,
           :duration,
           :updated_by_admin,
           :project_id,
           :starts_at,
           :ends_at,
           :duration,
           :body,
           :task,
           :tag,
           :preview,
           :user_id,
           :user,
           :project,
           :date, to: :work_time

  def save(additional_params = {})
    return false unless valid?

    @saved = WorkTime.transaction { create_filler_work_times(additional_params) }
    if @saved.present? && external_payload
      work_time = @saved.first
      UpdateExternalAuthWorker.perform_async(work_time.project_id, work_time.external_task_id, work_time.id)
    end
    errors.add(:starts_at, :no_gaps_to_fill) if @saved == []
    @saved.present?
  end

  attr_writer :work_time

  private

  def work_times_ranges
    filled = WorkTime.kept.where(user_id: user_id, ends_at: (starts_at..ends_at)).order(ends_at: :asc).pluck(:starts_at, :ends_at)
    return [(starts_at..ends_at)] if filled.empty?

    ranges = []
    ranges << (starts_at..filled.first[0]) if filled.first[0] > starts_at
    filled.each_cons(2).map { |left, right| ranges << (left[1]..right[0]) if left[1] < right[0] }
    ranges << (filled.last[1]..ends_at) if filled.last[1] < ends_at
    ranges
  end

  def create_filler_work_times(additional_params)
    work_times_ranges.map do |range|
      wt = work_time.dup
      wt.assign_attributes(starts_at: range.begin, ends_at: range.end, integration_payload: external_payload)
      unless wt.save(additional_params)
        copy_errors(wt)
        raise ActiveRecord::Rollback
      end
      wt
    end
  end

  def copy_errors(work_time)
    work_time.errors.details.each do |key, value|
      errors.add(key, value.first[:error], value.first.except(:error))
    end
  end
end
