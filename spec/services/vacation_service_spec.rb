# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationService do
  let(:staff_manager) { create(:staff_manager) }
  let(:admin) { create(:admin) }

  def response(vacation, interactor_name, previous_status, errors, warnings = [])
    {
      vacation: vacation,
      vacation_interaction: { user_full_name: interactor_name },
      previous_status: previous_status,
      errors: errors,
      warnings: warnings
    }
  end

  describe '#approve' do
    it 'returns error when thera are work times entries in vacation range' do
      create(:project, name: 'Vacation')
      vacation = create(:vacation)
      create(:work_time, user: vacation.user, starts_at: vacation.start_date.beginning_of_day + 8.hours, ends_at: vacation.start_date.beginning_of_day + 12.hours)
      warnings = [{ work_time: I18n.t('apps.staff.user_has_already_filled_in_work_time', parameter: vacation.user_full_name),
                    additional_info: vacation.start_date.strftime('%Y-%m-%d') }]
      expect(described_class.new(current_user: staff_manager, vacation: vacation).approve).to eql(response(vacation, staff_manager.to_s, 'unconfirmed', [], warnings))
    end

    it 'returns error when there is already vacation interaction' do
      create(:project, name: 'Vacation')
      vacation = create(:vacation)
      create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :accepted)
      errors = [{ vacation_interaction: I18n.t('activerecord.errors.models.vacation_interaction.base.already_interacted', action: I18n.t('apps.staff.accepted').downcase) }]
      expect(described_class.new(current_user: staff_manager, vacation: vacation).approve).to eql(response(vacation, staff_manager.to_s, 'unconfirmed', errors))
    end

    it 'returns error when user did not select vacation_sub_type for others vacations' do
      create(:project, name: 'ZKS')
      vacation = create(:vacation, description: 'Description', vacation_type: :others)
      errors = [{ vacation_sub_type: I18n.t('apps.staff.vacation_sub_type_empty') }]
      expect(described_class.new(current_user: staff_manager, vacation: vacation).approve).to eql(response(vacation, staff_manager.to_s, 'unconfirmed', errors))
    end

    context 'when current user can manage staff and is staff manager' do
      it 'accepts vacation, creates vacation work times, creates vacation interaction, deletes previous opposite vacation interaction' do
        vacation = create(:vacation, start_date: Time.current.to_date, end_date: Time.current.to_date + 7.days,
                                     status: :declined, description: 'Others', vacation_type: :others)
        create(:project, name: 'ZKS')
        vacation_interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :declined)

        expect(WorkTime.count).to eql(0)
        work_times_count = vacation.start_date.business_days_until(vacation.end_date + 1.day)

        described_class.new(current_user: staff_manager, vacation: vacation,
                            params: ActionController::Parameters.new(vacation: { vacation_sub_type: 'parental' })).approve

        expect(vacation.reload.status).to eql('accepted')
        expect(vacation.vacation_sub_type).to eql('parental')
        expect(WorkTime.count).to eql(work_times_count)
        expect(VacationInteraction.first).to_not eql(vacation_interaction)
        expect(VacationInteraction.first.action).to eql('accepted')
      end
    end

    context 'when current user can manage staff and is not staff member' do
      it 'approves vacation, creates vacation interaction, deletes previous opposite vacation interaction' do
        vacation = create(:vacation, start_date: Time.current.to_date, end_date: Time.current.to_date + 7.days, status: :declined)
        create(:project, name: 'Vacation')
        vacation_interaction = create(:vacation_interaction, user: admin, vacation: vacation, action: :declined)

        described_class.new(current_user: admin, vacation: vacation).approve

        expect(vacation.reload.status).to eql('approved')
        expect(WorkTime.count).to eql(0)
        expect(VacationInteraction.first).to_not eql(vacation_interaction)
        expect(VacationInteraction.first.action).to eql('approved')
      end
    end
  end

  describe '#decline' do
    it 'returns error when thera are work times entries in vacation range which are not vacation entries' do
      vacation = create(:vacation)
      create(:project, name: 'Vacation')
      create(:work_time, user: vacation.user, starts_at: vacation.start_date.beginning_of_day + 8.hours, ends_at: vacation.start_date.beginning_of_day + 12.hours)
      errors = [{ not_just_vacations: I18n.t('apps.staff.not_just_vacations', user: vacation.user_full_name) }]
      expect(described_class.new(current_user: staff_manager, vacation: vacation).decline).to eql(response(vacation, nil, 'unconfirmed', errors))
    end

    it 'declines vacation, destroys vacation work times, creates vacation interaction, deletes previous opposite vacation interaction' do
      vacation = create(:vacation, start_date: Time.current.to_date, end_date: Time.current.to_date + 7.days, status: :approved)
      project = create(:project, name: 'Vacation')
      create(:work_time, user: vacation.user, starts_at: vacation.start_date.beginning_of_day + 8.hours,
                         ends_at: vacation.start_date.beginning_of_day + 12.hours, project: project, vacation: vacation)
      vacation_interaction = create(:vacation_interaction, user: admin, vacation: vacation, action: :approved)

      described_class.new(current_user: admin, vacation: vacation).decline

      expect(vacation.reload.status).to eql('declined')
      expect(WorkTime.all.uniq.pluck(:active)).to eql([false])
      expect(VacationInteraction.first).to_not eql(vacation_interaction)
      expect(VacationInteraction.first.action).to eql('declined')
    end
  end

  describe '#undone' do
    context 'when current user can manage staff and is staff manager' do
      it 'when vacation is accepted, user accepts vacation and vacation have approvers and decliners' do
        vacation = create(:vacation, status: :accepted)
        create(:work_time, user: vacation.user, vacation: vacation, starts_at: vacation.start_date.beginning_of_day + 8.hours, ends_at: vacation.start_date.beginning_of_day + 12.hours)
        admin1 = create(:admin)
        admin2 = create(:admin)
        staff_manager = create(:staff_manager)
        create(:vacation_interaction, user: admin1, vacation: vacation, action: :approved)
        create(:vacation_interaction, user: admin2, vacation: vacation, action: :declined)
        interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :accepted)

        described_class.new(current_user: staff_manager, vacation: vacation).undone

        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('declined')
        expect(WorkTime.all.uniq.pluck(:active)).to eql([false])
      end

      it 'when vacation is declined, user accepts vacation and vacation have approvers and decliners' do
        vacation = create(:vacation, status: :declined)
        admin = create(:admin)
        staff_manager1 = create(:staff_manager)
        staff_manager2 = create(:staff_manager)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :approved)
        create(:vacation_interaction, user: staff_manager1, vacation: vacation, action: :declined)
        interaction = create(:vacation_interaction, user: staff_manager2, vacation: vacation, action: :accepted)

        described_class.new(current_user: staff_manager2, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('declined')
      end

      it 'when vacation is accepted, user accepts vacation and vacation have only approvers' do
        vacation = create(:vacation, status: :accepted)
        create(:work_time, user: vacation.user, vacation: vacation, starts_at: vacation.start_date.beginning_of_day + 8.hours, ends_at: vacation.start_date.beginning_of_day + 12.hours)
        admin = create(:admin)
        staff_manager = create(:staff_manager)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :approved)
        interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :accepted)

        described_class.new(current_user: staff_manager, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(WorkTime.all.uniq.pluck(:active)).to eql([false])
        expect(vacation.reload.status).to eql('approved')
      end

      it 'when vacation is accepted, user accepts vacation and vacation have only decliners' do
        vacation = create(:vacation, status: :accepted)
        create(:work_time, user: vacation.user, vacation: vacation, starts_at: vacation.start_date.beginning_of_day + 8.hours, ends_at: vacation.start_date.beginning_of_day + 12.hours)
        admin = create(:admin)
        staff_manager = create(:staff_manager)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :declined)
        interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :accepted)

        described_class.new(current_user: staff_manager, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(WorkTime.all.uniq.pluck(:active)).to eql([false])
        expect(vacation.reload.status).to eql('declined')
      end

      it 'when vacation is declined, user accepts vacation and vacation is declined by other staff manager' do
        vacation = create(:vacation, status: :declined)
        staff_manager1 = create(:staff_manager)
        staff_manager2 = create(:staff_manager)
        create(:vacation_interaction, user: staff_manager1, vacation: vacation, action: :declined)
        interaction = create(:vacation_interaction, user: staff_manager2, vacation: vacation, action: :accepted)

        described_class.new(current_user: staff_manager2, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('declined')
      end

      it 'when vacation is accepted, user accepts vacation and vacation have no other interactions' do
        vacation = create(:vacation, status: :accepted)
        create(:work_time, user: vacation.user, vacation: vacation, starts_at: vacation.start_date.beginning_of_day + 8.hours, ends_at: vacation.start_date.beginning_of_day + 12.hours)
        staff_manager = create(:staff_manager)
        interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :accepted)

        described_class.new(current_user: staff_manager, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(WorkTime.all.uniq.pluck(:active)).to eql([false])
        expect(vacation.reload.status).to eql('unconfirmed')
      end

      it 'when vacation is declined, user declines vacation and vacation have approvers and decliners' do
        vacation = create(:vacation, status: :declined)
        admin = create(:admin)
        staff_manager1 = create(:staff_manager)
        staff_manager2 = create(:staff_manager)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :declined)
        create(:vacation_interaction, user: staff_manager1, vacation: vacation, action: :accepted)
        interaction = create(:vacation_interaction, user: staff_manager2, vacation: vacation, action: :declined)

        described_class.new(current_user: staff_manager2, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('declined')
      end

      it 'when vacation is accepted, user declines vacation, vacation has beed accepted by other staff manager and have decliners' do
        vacation = create(:vacation, status: :accepted)
        create(:work_time, user: vacation.user, vacation: vacation, starts_at: vacation.start_date.beginning_of_day + 8.hours, ends_at: vacation.start_date.beginning_of_day + 12.hours)
        admin = create(:admin)
        staff_manager1 = create(:staff_manager)
        staff_manager2 = create(:staff_manager)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :declined)
        create(:vacation_interaction, user: staff_manager1, vacation: vacation, action: :accepted)
        interaction = create(:vacation_interaction, user: staff_manager2, vacation: vacation, action: :declined)

        described_class.new(current_user: staff_manager2, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(WorkTime.count).to eql(1)
        expect(vacation.reload.status).to eql('accepted')
      end

      it 'when vacation is declined, user declines vacation, vacation has been accepted by other staff manager' do
        vacation = create(:vacation, status: :declined)
        staff_manager1 = create(:staff_manager)
        staff_manager2 = create(:staff_manager)
        create(:vacation_interaction, user: staff_manager1, vacation: vacation, action: :accepted)
        create(:vacation_interaction, user: staff_manager2, vacation: vacation, action: :declined)

        described_class.new(current_user: staff_manager2, vacation: vacation).undone
        expect(VacationInteraction.count).to eql(1)
        expect(vacation.reload.status).to eql('accepted')
      end

      it 'when vacation is declined, user declines vacation, vacation have only approvers' do
        vacation = create(:vacation, status: :declined)
        admin = create(:admin)
        staff_manager = create(:staff_manager)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :approved)
        interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :declined)

        described_class.new(current_user: staff_manager, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('approved')
      end

      it 'when vacation is declined, user declines vacation, vacation have only decliners' do
        vacation = create(:vacation, status: :declined)
        admin = create(:admin)
        staff_manager = create(:staff_manager)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :declined)
        interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :declined)

        described_class.new(current_user: staff_manager, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('declined')
      end

      it 'when vacation is decline, user declines vacation, vacation have no other interactions' do
        vacation = create(:vacation, status: :declined)
        staff_manager = create(:staff_manager)
        interaction = create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :declined)

        described_class.new(current_user: staff_manager, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('unconfirmed')
      end
    end

    context 'when current user can manage staff and is not staff manager' do
      it 'when vacation is declined, user declines vacation, vacation have approvers and decliners' do
        vacation = create(:vacation, status: :declined)
        admin1 = create(:admin)
        admin2 = create(:admin)
        user = create(:admin)
        create(:vacation_interaction, user: admin1, vacation: vacation, action: :declined)
        create(:vacation_interaction, user: admin2, vacation: vacation, action: :approved)
        interaction = create(:vacation_interaction, user: user, vacation: vacation, action: :declined)

        described_class.new(current_user: user, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('declined')
      end

      it 'when vacation is declined, user declines vacation, vacation have only approvers' do
        vacation = create(:vacation, status: :declined)
        admin = create(:admin)
        user = create(:admin)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :approved)
        interaction = create(:vacation_interaction, user: user, vacation: vacation, action: :declined)

        described_class.new(current_user: user, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('approved')
      end

      it 'when vacation is declined, user declines vacation, vacation have only decliners' do
        vacation = create(:vacation, status: :declined)
        admin = create(:admin)
        user = create(:admin)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :declined)
        interaction = create(:vacation_interaction, user: user, vacation: vacation, action: :declined)

        described_class.new(current_user: user, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('declined')
      end

      it 'when vacation is declined, user declines vacation, vacation have no other interactions' do
        vacation = create(:vacation, status: :declined)
        user = create(:admin)
        interaction = create(:vacation_interaction, user: user, vacation: vacation, action: :declined)

        described_class.new(current_user: user, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('unconfirmed')
      end

      it 'when vacation is approved, user approves vacation, vacation have only approvers' do
        vacation = create(:vacation, status: :approved)
        admin = create(:admin)
        user = create(:admin)
        create(:vacation_interaction, user: admin, vacation: vacation, action: :approved)
        interaction = create(:vacation_interaction, user: user, vacation: vacation, action: :approved)

        described_class.new(current_user: user, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('approved')
      end

      it 'when vacation is approved, user approves vacation, vacation have no other interactions' do
        vacation = create(:vacation, status: :approved)
        user = create(:admin)
        interaction = create(:vacation_interaction, user: user, vacation: vacation, action: :approved)

        described_class.new(current_user: user, vacation: vacation).undone
        expect { interaction.reload }.to raise_exception(ActiveRecord::RecordNotFound)
        expect(vacation.reload.status).to eql('unconfirmed')
      end
    end
  end
end
