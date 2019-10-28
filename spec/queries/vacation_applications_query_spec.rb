# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationApplicationsQuery do
  let(:now) { Time.current.to_date }

  describe '#accepted_or_declined_vacations' do
    before(:each) do
      @admin = create(:admin)
      @staff_manager = create(:staff_manager)
      @accepted_vacation = create(:vacation, status: :accepted)
      @declined_vacation = create(:vacation, status: :declined)
      create(:vacation, status: :approved)
      create(:vacation)
    end

    context 'current user can manage staff and is staff manager' do
      it 'returns accepted vacation applications' do
        vacations = described_class.new(@staff_manager, {}).accepted_or_declined_vacations
        expect(vacations.field_values('id')).to eql([@accepted_vacation.id])
        expect(vacations.field_values('status')).to eql(['accepted'])
      end

      it 'returns declined vacation applications' do
        vacations = described_class.new(@staff_manager, show_declined: true).accepted_or_declined_vacations
        expect(vacations.field_values('id')).to eql([@declined_vacation.id])
        expect(vacations.field_values('status')).to eql(['declined'])
      end
    end

    context 'current user can manage staff and is not staff manager' do
      it 'returns accepted vacation applications' do
        vacations = described_class.new(@admin, {}).accepted_or_declined_vacations
        expect(vacations.field_values('id')).to eql([@accepted_vacation.id])
        expect(vacations.field_values('status')).to eql(['accepted'])
      end

      it 'returns accepted vacation applications regardless show_declined flag' do
        vacations = described_class.new(@admin, show_declined: true).accepted_or_declined_vacations
        expect(vacations.field_values('id')).to eql([@accepted_vacation.id])
        expect(vacations.field_values('status')).to eql(['accepted'])
      end
    end
  end

  describe '#unconfirmed_vacations' do
    before(:each) do
      @staff_manager = create(:staff_manager)
      @admin = create(:admin)
      @approved_vacation = create(:vacation, status: :approved, start_date: now, end_date: now + 1.day)
      @unconfirmed_vacation = create(:vacation, start_date: now + 1.day, end_date: now + 2.days)
      @other_vacation = create(:vacation, vacation_type: :others, description: 'Other vacation', start_date: now + 2.days, end_date: now + 3.days)
      @accepted_vacation = create(:vacation, status: :accepted, start_date: now + 3.days, end_date: now + 4.days)
      @declined_vacation = create(:vacation, status: :declined, start_date: now + 4.days, end_date: now + 5.days)
      create(:vacation_interaction, user: @admin, vacation: @declined_vacation)
    end

    context 'current_user can manage staff and is staff manager' do
      it 'returns approved vacations and vacations with vacation_type :others' do
        vacations = described_class.new(@staff_manager, {}).unconfirmed_vacations
        expect(vacations.field_values('id')).to eql([@approved_vacation.id, @other_vacation.id])
        expect(vacations.field_values('status')).to eql(%w[approved unconfirmed])
      end

      it 'returns all vacations' do
        vacations = described_class.new(@staff_manager, show_all: true).unconfirmed_vacations
        expect(vacations.field_values('id')).to eql([@approved_vacation.id, @unconfirmed_vacation.id,
                                                     @other_vacation.id, @accepted_vacation.id, @declined_vacation.id])
        expect(vacations.field_values('status')).to eql(%w[approved unconfirmed unconfirmed accepted declined])
      end
    end

    context 'current_user can manage staff and is not staff manager' do
      it 'returns unconfirmed, approved and declined by user vacations without vacations with vacation_type :others' do
        vacations = described_class.new(@admin, {}).unconfirmed_vacations
        expect(vacations.field_values('id')).to eql([@approved_vacation.id, @unconfirmed_vacation.id, @declined_vacation.id])
        expect(vacations.field_values('status')).to eql(%w[approved unconfirmed declined])
      end

      it 'returns unconfirmed, approved and declined by user vacations without vacations with vacation_type :others regardless of show_all flag' do
        vacations = described_class.new(@admin, show_all: true).unconfirmed_vacations
        expect(vacations.field_values('id')).to eql([@approved_vacation.id, @unconfirmed_vacation.id, @declined_vacation.id])
        expect(vacations.field_values('status')).to eql(%w[approved unconfirmed declined])
      end
    end
  end

  describe 'filters vacations' do
    it 'by user' do
      admin = create(:admin)
      user = create(:user)
      create(:vacation, user: admin, status: :accepted)
      create(:vacation, user: admin)
      user_accepted_vacation = create(:vacation, user: user, status: :accepted)
      user_unconfirmed_vacation = create(:vacation, user: user)

      described_class_instance = described_class.new(admin, user_id: user.id)
      expect(described_class_instance.accepted_or_declined_vacations.field_values('id')).to eql([user_accepted_vacation.id])
      expect(described_class_instance.unconfirmed_vacations.field_values('id')).to eql([user_unconfirmed_vacation.id])
    end

    context 'by date' do
      before(:each) do
        @admin = create(:admin)
        @present_vacation = create(:vacation, start_date: Time.current.to_date, end_date: Time.current.to_date + 7.days)
        @past_vacation = create(:vacation, start_date: Time.current.to_date - 30.days, end_date: Time.current.to_date - 20.days)
        @future_vacation = create(:vacation, start_date: Time.current.to_date + 10.days, end_date: Time.current.to_date + 20.days)
      end

      it 'when given only start_date' do
        described_class_instance = described_class.new(@admin, start_date: Time.current.to_date - 19.days)

        expect(described_class_instance.unconfirmed_vacations.field_values('id')).to eql([@present_vacation.id, @future_vacation.id])
        [@present_vacation, @past_vacation, @future_vacation].each { |v| v.update(status: :accepted) }
        expect(described_class_instance.accepted_or_declined_vacations.field_values('id')).to eql([@present_vacation.id, @future_vacation.id])
      end

      it 'when given only end_date' do
        described_class_instance = described_class.new(@admin, end_date: Time.current.to_date + 9.days)

        expect(described_class_instance.unconfirmed_vacations.field_values('id')).to eql([@past_vacation.id, @present_vacation.id])
        [@present_vacation, @past_vacation, @future_vacation].each { |v| v.update(status: :accepted) }
        expect(described_class_instance.accepted_or_declined_vacations.field_values('id')).to eql([@past_vacation.id, @present_vacation.id])
      end

      it 'when given start_date and end_date' do
        described_class_instance = described_class.new(@admin, start_date: Time.current.to_date - 19.days,
                                                               end_date: Time.current.to_date + 9.days)

        expect(described_class_instance.unconfirmed_vacations.field_values('id')).to eql([@present_vacation.id])
        [@present_vacation, @past_vacation, @future_vacation].each { |v| v.update(status: :accepted) }
        expect(described_class_instance.accepted_or_declined_vacations.field_values('id')).to eql([@present_vacation.id])
      end
    end

    context 'by vacation' do
      it 'returns specific vacation' do
        admin = create(:admin)
        vacation1 = create(:vacation)
        create(:vacation)

        described_class_instance = described_class.new(admin, id: vacation1.id)

        expect(described_class_instance.vacation.field_values('id')).to eql([vacation1.id])
      end
    end
  end

  describe 'returns correct values' do
    it 'for #accepted_or_declined_vacations' do
      admin = create(:admin)
      vacation = create(:vacation, user: admin, status: :accepted)
      create(:vacation_interaction, user: admin, vacation: vacation, action: :accepted)
      response = {
        id: vacation.id,
        approvers: admin.to_s,
        decliners: '',
        description: nil,
        interacted: true,
        start_date: vacation.start_date.to_date.strftime('%Y-%m-%d'),
        end_date: vacation.end_date.to_date.strftime('%Y-%m-%d'),
        status: 'accepted',
        user_id: vacation.user_id,
        vacation_type: vacation.vacation_type,
        vacation_sub_type: nil,
        full_name: vacation.user.to_s
      }.stringify_keys

      expect(described_class.new(admin, {}).accepted_or_declined_vacations.first).to eql(response)
    end

    it 'for #unconfirmed_vacations' do
      staff_manager = create(:staff_manager)
      vacation = create(:vacation, user: staff_manager, status: :declined)
      create(:vacation_interaction, user: staff_manager, vacation: vacation, action: :declined)
      response = {
        id: vacation.id,
        approvers: '',
        decliners: staff_manager.to_s,
        description: nil,
        interacted: true,
        start_date: vacation.start_date.to_date.strftime('%Y-%m-%d'),
        end_date: vacation.end_date.to_date.strftime('%Y-%m-%d'),
        status: 'declined',
        user_id: vacation.user_id,
        vacation_type: vacation.vacation_type,
        vacation_sub_type: nil,
        full_name: vacation.user.to_s
      }.stringify_keys

      expect(described_class.new(staff_manager, show_all: true).unconfirmed_vacations.first).to eql(response)
    end
  end
end
