# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class VacationService
  def initialize(current_user:, vacation:, params: {})
    @current_user = current_user
    @vacation = vacation
    @vacation_work_times = @vacation.work_times.kept
    @previous_status = @vacation.status
    @params = params
    @errors = []
    @warnings = []
  end

  def approve
    work_times = vacation_work_times_service.work_times
    work_time_warning(work_times.pluck(Arel.sql('date(work_times.starts_at)'), Arel.sql('date(work_times.ends_at)')).flatten.uniq) if work_times.any?

    approve_transaction
    increase_work_times if @vacation_interaction && @vacation_interaction.action == 'accepted'
    response
  end

  def decline
    decline_transaction
    response
  end

  def undone
    remove_previous_interaction(%w[declined approved accepted])
    previous_status = @vacation.status
    ids = @vacation_work_times.pluck(:id)
    undone_vacation
    vacation_work_times_service.save if @vacation.status == 'accepted' && @vacation.work_times.kept.empty?
    increase_work_times if @vacation.status == 'accepted' && previous_status == 'declined'
    decrease_work_times(ids) if ids.any? && previous_status == 'accepted' && @vacation.status != 'accepted'

    @vacation.assignments.destroy_all if @vacation.assignments.any? && @previous_status == 'accepted' && !@vacation.accepted?
    response
  end

  private

  def approve_transaction
    ActiveRecord::Base.transaction do
      PaperTrail.request.disable_model(ProjectResourceAssignment)
      vacation_sub_type_error unless approve_vacation
      create_vacation_event if @vacation.accepted?
      vacation_work_times_service.save
      @vacation_interaction = create_vacation_interaction(:approved)
      remove_previous_interaction(%w[declined])

      raise ActiveRecord::Rollback unless @errors.empty?
    end
  end

  def vacation_work_times_service
    @vacation_work_times_service ||= VacationWorkTimesService.new(@vacation, @current_user)
  end

  def work_time_warning(work_times)
    @warnings << { work_time: I18n.t('apps.staff.user_has_already_filled_in_work_time', parameter: @vacation.user_full_name),
                   additional_info: work_times.join(', ') }
  end

  def approve_vacation
    if @current_user.staff_manager?
      @vacation.update(accept_vacations_params.merge(status: :accepted))
    else
      @vacation.update(accept_vacations_params.merge(status: :approved)) unless @vacation.accepted?
    end
  end

  def create_vacation_event
    vacation_user = User.find(@vacation.user_id)
    user_resources_ids = vacation_user.project_resources.pluck(:id, :rid)
    vacation_project = Project.find_by(name: 'Vacation')
    starts_at = @vacation.start_date.beginning_of_day
    ends_at = @vacation.end_date.end_of_day
    user_resources_ids.each do |id, rid|
      ProjectResourceAssignment.create!(user_id: vacation_user.id, project_id: vacation_project.id, project_resource_id: id, resource_rid: rid, vacation_id: @vacation.id,
                                        starts_at: starts_at, ends_at: ends_at, title: vacation_project.name, color: "##{vacation_project.color}", type: 2,
                                        resizable: false, movable: false)
    end
  end

  def create_vacation_interaction(action)
    vacation_interaction = VacationInteraction.new(vacation_interaction_params(action))
    vacation_interaction.valid? ? vacation_interaction.save : vacation_interaction_error(vacation_interaction.errors)
    vacation_interaction
  end

  def vacation_interaction_params(action)
    action = @current_user.staff_manager? ? :accepted : :approved if action == :approved
    {
      user_id: @current_user.id,
      vacation_id: @vacation.id,
      action: action
    }
  end

  def vacation_interaction_error(errors)
    error_list = []
    errors.details[errors.details.keys[0]].each { |error| error_list << error[error.keys[0]] }
    @errors << { vacation_interaction: error_list.join(', ') }
  end

  def deactivate_vacation_work_times
    @vacation.work_times.kept.each(&:discard!)
  end

  def decline_transaction
    ActiveRecord::Base.transaction do
      @vacation.update!(status: :declined)
      PaperTrail.request.disable_model(ProjectResourceAssignment)
      deactivate_vacation_work_times if @vacation.work_times.any?
      @vacation.assignments.discard_all if @vacation.assignments.any?
      @vacation_interaction = create_vacation_interaction(:declined)
      remove_previous_interaction(%w[approved accepted])

      raise ActiveRecord::Rollback unless @errors.empty?
    end
  end

  def remove_previous_interaction(status)
    previous_interactions = VacationInteraction.where(user_id: @current_user.id, vacation_id: @vacation.id, action: status)
    previous_interactions.destroy_all if previous_interactions.any?
  end

  def vacation_sub_type_error
    @errors << { vacation_sub_type: I18n.t('apps.staff.vacation_sub_type_empty') }
  end

  def undone_vacation
    if @vacation.status == 'accepted' && @current_user.staff_manager?
      undone_accepted_vacation
      deactivate_vacation_work_times if !@vacation.accepted? && @vacation_work_times.any?
    elsif @vacation.status == 'declined'
      undone_declined_vacation
    else
      undone_accepted_vacation
    end
  end

  def undone_accepted_vacation
    return if previous_interactions.accepted.any?

    if previous_interactions.any?
      if previous_interactions.declined.any?
        @vacation.update(status: :declined)
      elsif previous_interactions.approved.any?
        @vacation.update(status: :approved)
      end
    else
      @vacation.update(status: :unconfirmed)
    end
  end

  def undone_declined_vacation
    return if previous_interactions.declined.any?

    if previous_interactions.any?
      if previous_interactions.accepted.any? && @current_user.staff_manager?
        @vacation.update(status: :accepted)
      elsif previous_interactions.approved.any?
        @vacation.update(status: :approved)
      end
    else
      @vacation.update(status: :unconfirmed)
    end
  end

  def previous_interactions
    @previous_interactions ||= VacationInteraction.where(vacation_id: @vacation.id)
  end

  def increase_work_times
    @vacation.work_times.kept.each do |wt|
      IncreaseWorkTimeWorker.perform_async(user_id: @vacation.user_id, duration: wt.duration, starts_at: wt.starts_at, ends_at: wt.ends_at, date: wt.starts_at.to_date)
    end
  end

  def decrease_work_times(ids)
    ids.each do |id|
      wt = WorkTime.find(id)
      DecreaseWorkTimeWorker.perform_async(duration: wt.duration, date: wt.starts_at.to_date, user_id: @vacation.user_id)
    end
  end

  def response
    {
      vacation: @vacation,
      vacation_interaction: { user_full_name: @vacation_interaction ? @vacation_interaction.user.to_s : nil },
      previous_status: @previous_status,
      errors: @errors,
      warnings: @warnings,
      user_available_vacation_days: User.find(@vacation.user_id).available_vacation_days
    }
  end

  def accept_vacations_params
    if @params.present?
      @params.require(:vacation)
             .permit(
               %i[
                 vacation_sub_type
               ]
             )
    else
      {}
    end
  end
end
# rubocop:enable Metrics/ClassLength
