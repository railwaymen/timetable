# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class VacationService
  def initialize(current_user:, vacation:, params: {})
    @current_user = current_user
    @vacation = vacation
    @previous_status = @vacation.status
    @params = params
    @errors = []
  end

  def approve
    return too_early_error if @vacation.start_date > 1.month.from_now || @vacation.end_date > 1.month.from_now

    work_times = vacation_work_times_service.work_times
    return work_time_error(work_times.pluck('date(work_times.starts_at)', 'date(work_times.ends_at)').flatten.uniq) if work_times.any?

    approve_transaction

    response
  end

  def decline
    check_work_times_for_vacations
    return response if @errors.any?

    ActiveRecord::Base.transaction do
      @vacation.update!(status: :declined)
      deactivate_vacation_work_times if @vacation.work_times.any?
      @vacation_interaction = create_vacation_interaction(:declined)
      remove_previous_interaction(%w[approved accepted])

      raise ActiveRecord::Rollback unless @errors.empty?
    end

    response
  end

  def undone
    remove_previous_interaction(%w[declined approved accepted])
    if @vacation.status == 'accepted' && @current_user.staff_manager?
      undone_accepted_vacation
      deactivate_vacation_work_times if !@vacation.accepted? && @vacation.work_times.any?
    elsif @vacation.status == 'declined'
      undone_declined_vacation
    else
      undone_accepted_vacation
    end

    response
  end

  private

  def approve_transaction
    ActiveRecord::Base.transaction do
      vacation_sub_type_error unless approve_vacation
      vacation_work_times_service.save
      @vacation_interaction = create_vacation_interaction(:approved)
      remove_previous_interaction(%w[declined])

      raise ActiveRecord::Rollback unless @errors.empty?
    end
  end

  def too_early_error
    @errors << { too_early: I18n.t('apps.staff.too_early') }
    response
  end

  def vacation_work_times_service
    @vacation_work_times_service ||= VacationWorkTimesService.new(@vacation, @current_user)
  end

  def work_time_error(work_times)
    @errors << { work_time: I18n.t('apps.staff.user_has_already_filled_in_work_time', parameter: @vacation.user_full_name),
                 additional_info: work_times.join(', ') }
    response
  end

  def approve_vacation
    if @current_user.staff_manager?
      @vacation.update(accept_vacations_params.merge(status: :accepted))
    else
      @vacation.update(accept_vacations_params.merge(status: :approved)) unless @vacation.accepted?
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

  def check_work_times_for_vacations
    work_times = vacation_work_times_service.work_times.includes(:project)
    work_times_project_names = work_times.pluck('projects.name').uniq
    not_just_vacations if work_times.any? && (work_times_project_names.length > 1 || work_times_project_names[0] != 'Vacation')
    work_times
  end

  def not_just_vacations
    @errors << { not_just_vacations: I18n.t('apps.staff.not_just_vacations', user: @vacation.user_full_name) }
  end

  def deactivate_vacation_work_times
    @vacation.work_times.find_each { |wt| wt.update(active: false) }
  end

  def remove_previous_interaction(status)
    previous_interactions = VacationInteraction.where(user_id: @current_user.id, vacation_id: @vacation.id, action: status)
    previous_interactions.destroy_all if previous_interactions.any?
  end

  def vacation_sub_type_error
    @errors << { vacation_sub_type: I18n.t('apps.staff.vacation_sub_type_empty') }
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
      if previous_interactions.accepted.any?
        @vacation.update(status: :unconfirmed)
        previous_interactions.destroy_all
      end
      @vacation.update(status: :approved) if previous_interactions.approved.any?
    else
      @vacation.update(status: :unconfirmed)
    end
  end

  def previous_interactions
    @previous_interactions ||= VacationInteraction.where(vacation_id: @vacation.id)
  end

  def response
    {
      vacation: @vacation,
      vacation_interaction: { user_full_name: @vacation_interaction ? @vacation_interaction.user.to_s : nil },
      previous_status: @previous_status,
      errors: @errors
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
