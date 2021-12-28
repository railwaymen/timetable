# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::VacationsController do
  let(:user) { create(:user) }
  let(:staff_manager) { create(:user, :staff_manager) }
  let(:admin) { create(:user, :admin) }
  let(:vacation_applications_query) { instance_double(VacationApplicationsQuery) }
  let(:vacation_service) { instance_double(VacationService) }
  let(:csv_staff_generator_service) { instance_double(CsvStaffGeneratorService) }
  let(:yearly_report_generator_service) { instance_double(VacationsYearlyReportGenerator) }
  let(:default_params) { ActionController::Parameters.new(format: 'json', controller: 'api/vacations') }

  def vacation_response_with_description(vacation)
    vacation.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status', 'description')
  end

  def unconfirmed_vacation_response(vacation)
    vacation.attributes.slice('id', 'user_id', 'start_date', 'end_date', 'vacation_type', 'vacation_sub_type', 'status', 'description', 'business_days_count')
            .merge(approvers: nil, decliners: nil, full_name: nil, interacted: nil, self_declined: false)
  end

  def vacation_service_response(vacation, current_user)
    {
      vacation_interaction: { user_full_name: current_user.to_s },
      errors: [],
      vacation: vacation,
      previous_status: vacation.status,
      warnings: []
    }
  end

  def used_vacation_days_response
    {
      planned: 0, requested: 0, compassionate: 0, paternity: 0, parental: 0, upbringing: 0, unpaid: 0,
      rehabilitation: 0, illness: 0, care: 0, overtime: 0
    }
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns user vacation applications' do
      travel_to Date.new(2021, 10, 10) do
        sign_in(user)
        create(:vacation_period, user: user)
        vacation1 = create(:vacation, user: user)
        vacation2 = create(:vacation, user: user, start_date: Time.current + 4.days, end_date: Time.current + 10.days,
                                      vacation_type: :others, vacation_sub_type: :parental, description: 'Parental', status: :accepted)
        vacation3 = create(:vacation, user: user, vacation_type: :requested, status: :accepted)
        vacations_response = [
          vacation1.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status', 'business_days_count', 'description').merge(full_name: user.to_s),
          vacation3.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status', 'business_days_count', 'description').merge(full_name: user.to_s),
          vacation2.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status', 'business_days_count', 'description').merge(full_name: user.to_s)
        ]
        get :index, params: { year: Time.current.year }, format: :json
        expect(response.code).to eql('200')
        available_vacation_days = user.available_vacation_days
        used_vacation_days = user.used_vacation_days(Vacation.all)
        expect(response.body).to be_json_eql({ records: vacations_response, available_vacation_days: available_vacation_days, used_vacation_days: used_vacation_days }.to_json)
      end
    end

    it 'filters user vacation applications by year' do
      sign_in(user)
      vacation_period = create(:vacation_period, vacation_days: 10, user: user, starts_at: 1.year.ago.beginning_of_year, ends_at: 1.year.ago.end_of_year)
      create(:vacation, user: user)
      get :index, params: { year: (Time.current - 1.year).year }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql({ records: [], available_vacation_days: vacation_period.vacation_days, used_vacation_days: used_vacation_days_response }.to_json)
    end

    it 'filters user vacation applications by user' do
      sign_in(staff_manager)
      user2 = create(:user)
      vacation_period = create(:vacation_period, user: user2)
      vacation = create(:vacation, user: user2)
      vacations_response = [
        vacation.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status', 'business_days_count', 'description').merge(full_name: user2.to_s)
      ]
      get :index, params: { user_id: user2.id, year: Time.current.year }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql({ records: vacations_response, available_vacation_days: vacation_period.vacation_days, used_vacation_days: used_vacation_days_response }.to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    context 'regular user' do
      it 'with valid params' do
        sign_in(user)
        create_params = {
          start_date: Time.current.to_date,
          end_date: Time.current.to_date + 4.days,
          vacation_type: 'requested',
          description: 'Description'
        }
        post :create, params: { vacation: create_params }, format: :json
        expect(response.code).to eql('200')
        vacation = Vacation.last
        expect(vacation.reload.user_id).to eql(user.id)
        expect(vacation.start_date).to eql(create_params[:start_date])
        expect(vacation.end_date).to eql(create_params[:end_date])
        expect(vacation.vacation_type).to eql(create_params[:vacation_type])
        expect(vacation.description).to eql(create_params[:description])
      end
    end

    context 'staff manager' do
      it 'creates vacation for given user with valid params' do
        sign_in(staff_manager)
        user = create(:user)

        create_params = {
          user_id: user.id,
          start_date: Time.current.to_date,
          end_date: Time.current.to_date + 4.days,
          vacation_type: 'requested',
          description: 'Description'
        }
        post :create, params: { vacation: create_params }, format: :json
        expect(response.code).to eql('200')
        vacation = Vacation.last
        expect(vacation.reload.user_id).to eql(user.id)
        expect(vacation.start_date).to eql(create_params[:start_date])
        expect(vacation.end_date).to eql(create_params[:end_date])
        expect(vacation.vacation_type).to eql(create_params[:vacation_type])
        expect(vacation.description).to eql(create_params[:description])
      end
    end
  end

  describe '#show' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      get :vacation_applications, format: :json
      expect(response.code).to eql('403')
    end

    it 'returns specific vacation' do
      sign_in(admin)
      vacation = create(:vacation)
      get :show, params: { id: vacation.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(vacation.attributes.slice('id', 'user_id', 'start_date', 'end_date', 'vacation_type', 'status', 'description', 'vacation_sub_type')
                                                              .merge(full_name: vacation.user.to_s, approvers: '', decliners: '', interacted: nil,
                                                                     available_vacation_days: 0, self_declined: false).to_json)
    end
  end

  describe '#vacation_applications' do
    it 'authenticates user' do
      get :vacation_applications, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      get :vacation_applications, format: :json
      expect(response.code).to eql('403')
    end

    context 'returns accepted and unconfirmed vacations' do
      it 'with number of vacation days left for user' do
        sign_in(staff_manager)
        vacation_period = create(:vacation_period, user: user)
        accepted_vacation = create(:vacation, user: user, description: 'Accepted', status: :accepted)
        unconfirmed_vacation = create(:vacation, user: user, description: 'Unconfirmed')
        available_vacation_days = vacation_period.vacation_days - accepted_vacation.business_days_count
        expect(VacationApplicationsQuery).to receive(:new).with(staff_manager, default_params.merge(action: 'vacation_applications')).and_return(vacation_applications_query)
        expect(vacation_applications_query).to receive(:accepted_or_declined_vacations).and_return([accepted_vacation])
        expect(vacation_applications_query).to receive(:unconfirmed_vacations).and_return([unconfirmed_vacation])
        get :vacation_applications, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql({ accepted_or_declined_vacations: [vacation_response_with_description(accepted_vacation).merge(full_name: nil)],
                                               unconfirmed_vacations: [unconfirmed_vacation_response(unconfirmed_vacation).merge(available_vacation_days: available_vacation_days)] }.to_json)
      end

      it 'without number of vacation days left for user' do
        sign_in(admin)
        create(:vacation_period, user: user)
        accepted_vacation = create(:vacation, user: user, description: 'Accepted', status: :accepted)
        unconfirmed_vacation = create(:vacation, user: user, description: 'Unconfirmed')
        expect(VacationApplicationsQuery).to receive(:new).with(admin, default_params.merge(action: 'vacation_applications')).and_return(vacation_applications_query)
        expect(vacation_applications_query).to receive(:accepted_or_declined_vacations).and_return([accepted_vacation])
        expect(vacation_applications_query).to receive(:unconfirmed_vacations).and_return([unconfirmed_vacation])
        get :vacation_applications, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql({ accepted_or_declined_vacations: [vacation_response_with_description(accepted_vacation).merge(full_name: nil)],
                                               unconfirmed_vacations: [unconfirmed_vacation_response(unconfirmed_vacation).merge(available_vacation_days: nil)] }.to_json)
      end
    end

    context 'for leader' do
      it 'does not return description info' do
        leader = create(:project, :with_leader).leader
        sign_in(leader)
        accepted_vacation = create(:vacation, user: user, description: 'Accepted', status: :accepted)
        unconfirmed_vacation = create(:vacation, user: user, description: 'Unconfirmed')
        expect(VacationApplicationsQuery).to receive(:new).with(leader, default_params.merge(action: 'vacation_applications')).and_return(vacation_applications_query)
        expect(vacation_applications_query).to receive(:accepted_or_declined_vacations).and_return([accepted_vacation])
        expect(vacation_applications_query).to receive(:unconfirmed_vacations).and_return([unconfirmed_vacation])
        get :vacation_applications, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql({ accepted_or_declined_vacations: [vacation_response_with_description(accepted_vacation).merge(full_name: nil).except('description')],
                                               unconfirmed_vacations: [unconfirmed_vacation_response(unconfirmed_vacation).merge(available_vacation_days: nil).except('description')] }.to_json)
      end
    end
  end

  describe '#decline' do
    it 'authenticates user' do
      post :decline, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :decline, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'declines vacation' do
      sign_in(staff_manager)
      vacation = create(:vacation, user: user, description: 'Declined')
      expect(VacationService).to receive(:new).with(vacation: vacation, current_user: staff_manager, params: default_params.merge(vacation_id: vacation.id.to_s, action: 'decline')).and_return(vacation_service)
      expect(vacation_service).to receive(:decline).and_return(vacation_service_response(vacation, staff_manager))
      post :decline, params: { vacation_id: vacation.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ user_full_name: staff_manager.to_s,
                                             errors: [],
                                             vacation: vacation_response_with_description(vacation.reload).merge(full_name: user.to_s, user_id: vacation.user_id),
                                             previous_status: 'unconfirmed',
                                             warnings: [],
                                             user_available_vacation_days: nil }.to_json)
    end

    context 'for leader' do
      it 'declines & does not return description info' do
        leader = create(:project, :with_leader).leader
        sign_in(leader)
        vacation = create(:vacation, user: user, description: 'Declined')
        expect(VacationService).to receive(:new).with(vacation: vacation, current_user: leader, params: default_params.merge(vacation_id: vacation.id.to_s, action: 'decline')).and_return(vacation_service)
        expect(vacation_service).to receive(:decline).and_return(vacation_service_response(vacation, leader))
        post :decline, params: { vacation_id: vacation.id }, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql({ user_full_name: leader.to_s,
                                               errors: [],
                                               vacation: vacation_response_with_description(vacation.reload).merge(full_name: user.to_s, user_id: vacation.user_id).except('description'),
                                               previous_status: 'unconfirmed',
                                               warnings: [],
                                               user_available_vacation_days: nil }.to_json)
      end
    end
  end

  describe '#approve' do
    it 'authenticates user' do
      post :approve, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :approve, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'approves vacation' do
      sign_in(admin)
      vacation = create(:vacation, user: user, description: 'Approved')
      expect(VacationService).to receive(:new).with(vacation: vacation, current_user: admin, params: default_params.merge(vacation_id: vacation.id.to_s, action: 'approve')).and_return(vacation_service)
      expect(vacation_service).to receive(:approve).and_return(vacation_service_response(vacation, admin))
      post :approve, params: { vacation_id: vacation.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ user_full_name: admin.to_s,
                                             errors: [],
                                             vacation: vacation_response_with_description(vacation.reload).merge(full_name: user.to_s, user_id: vacation.user_id),
                                             previous_status: 'unconfirmed',
                                             warnings: [],
                                             user_available_vacation_days: nil }.to_json)
    end
  end

  describe '#undone' do
    it 'authenticates user' do
      post :undone, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :undone, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'undone previous action' do
      sign_in(staff_manager)
      vacation = create(:vacation, user: user, description: 'Undone', status: :accepted)
      expect(VacationService).to receive(:new).with(vacation: vacation, current_user: staff_manager, params: default_params.merge(vacation_id: vacation.id.to_s, action: 'undone')).and_return(vacation_service)
      expect(vacation_service).to receive(:undone).and_return(vacation_service_response(vacation, staff_manager))
      post :undone, params: { vacation_id: vacation.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ user_full_name: staff_manager.to_s,
                                             errors: [],
                                             vacation: vacation_response_with_description(vacation.reload).merge(full_name: user.to_s, user_id: vacation.user_id),
                                             previous_status: 'accepted',
                                             warnings: [],
                                             user_available_vacation_days: nil }.to_json)
    end
  end

  describe '#generate_csv' do
    it 'authenticates user' do
      post :generate_csv, format: :csv
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :generate_csv, format: :csv
      expect(response.code).to eql('403')
    end

    it 'generates csv' do
      sign_in(staff_manager)
      create(:vacation, user: user)
      expect(CsvStaffGeneratorService).to receive(:new).with(user_id: nil, start_date: nil, end_date: nil).and_return(csv_staff_generator_service)
      expect(csv_staff_generator_service).to receive(:generate).and_return(nil)
      expect(csv_staff_generator_service).to receive(:filename).and_return('vacations_report.csv')
      get :generate_csv, format: :csv
      expect(response.code).to eql('200')
      expect(response.header['Content-Type']).to eql('text/csv')
      expect(response.header['Content-Disposition']).to include('attachment; filename="vacations_report.csv"')
    end
  end

  describe '#destroy' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'destroys vacation' do
      sign_in(user)
      vacation = create(:vacation)
      delete :destroy, params: { id: vacation.id }, format: :json
      expect(response.code).to eql('204')
      expect { Vacation.find(vacation.id) }.to raise_exception(ActiveRecord::RecordNotFound)
      expect(Vacation.count).to eql(0)
    end
  end

  describe '#self_decline' do
    it 'authenticates user' do
      put :self_decline, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    context 'regular user' do
      it 'declines vacation and set self_declined attribute to true' do
        sign_in(user)
        vacation = create(:vacation, user: user)

        put :self_decline, params: { vacation_id: vacation.id }, format: :json
        expect(vacation.reload.status).to eql('declined')
        expect(vacation.self_declined).to eql(true)
      end
    end

    context 'staff manager' do
      it 'declines vacation and set self_declined attribute to true' do
        sign_in(staff_manager)
        vacation = create(:vacation)

        put :self_decline, params: { vacation_id: vacation.id }, format: :json
        expect(vacation.reload.status).to eql('declined')
        expect(vacation.self_declined).to eql(true)
      end
    end
  end

  describe '#generate_yearly_report' do
    it 'authenticates user' do
      get :generate_yearly_report, format: :csv
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      get :generate_yearly_report, format: :csv
      expect(response.code).to eql('403')
    end

    it 'generates yealry report' do
      sign_in(staff_manager)
      create(:vacation, user: user)
      expect(VacationsYearlyReportGenerator).to receive(:new).and_return(yearly_report_generator_service)
      expect(yearly_report_generator_service).to receive(:generate).and_return(nil)
      get :generate_yearly_report, format: :csv
      expect(response.code).to eql('200')
      expect(response.header['Content-Type']).to eql('text/csv')
      expect(response.header['Content-Disposition']).to include('attachment; filename="vacations_yearly_report.csv"')
    end
  end

  describe '#update"_dates' do
    it 'authenticates user' do
      post :update_dates, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :update_dates, params: { vacation_id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'should update vacation dates' do
      sign_in(staff_manager)
      vacation = create(:vacation, user: user)
      new_dates = {
        start_date: (Time.current + 10.days).to_date,
        end_date: (Time.current + 12.days).to_date
      }

      post :update_dates, params: { vacation_id: vacation.id, vacation: new_dates }, format: :json
      expect(vacation.reload.start_date).to eql(new_dates[:start_date])
      expect(vacation.end_date).to eql(new_dates[:end_date])
    end
  end
end
