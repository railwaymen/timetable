# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::VacationsController do
  render_views
  let(:user) { create(:user) }
  let(:staff_manager) { create(:staff_manager) }
  let(:admin) { create(:admin) }
  let(:vacation_applications_query) { instance_double(VacationApplicationsQuery) }
  let(:vacation_service) { instance_double(VacationService) }
  let(:csv_staff_generator_service) { instance_double(CsvStaffGeneratorService) }
  let(:default_params) { ActionController::Parameters.new(format: 'json', controller: 'api/vacations') }

  def vacation_response(vacations)
    array = []
    vacations.find_each do |v|
      array.push(v.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status'))
    end
    array
  end

  def vacation_response_with_description(vacation)
    vacation.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status', 'description')
  end

  def unconfirmed_vacation_response(vacation)
    vacation.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'vacation_sub_type', 'status', 'description')
            .merge(approvers: nil, decliners: nil, full_name: nil, interacted: nil)
  end

  def vacation_service_response(vacation, current_user)
    {
      vacation_interaction: { user_full_name: current_user.to_s },
      errors: [],
      vacation: vacation,
      previous_status: vacation.status
    }
  end

  def used_vacation_days_response
    { requested: 0, compassionate: 0, paternity: 0, parental: 0, upbringing: 0, unpaid: 0, rehabilitation: 0, illness: 0, care: 0 }
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns user vacation applications' do
      sign_in(user)
      create(:vacation_period, user: user)
      create(:vacation, user: user)
      create(:vacation, user: user, start_date: Time.current + 4.days, end_date: Time.current + 10.days,
                        vacation_type: :others, vacation_sub_type: :parental, description: 'Parental', status: :accepted)
      create(:vacation, user: user, vacation_type: :requested, status: :accepted)
      get :index, params: { year: Time.current.year }, format: :json
      expect(response.code).to eql('200')
      available_vacation_days = user.available_vacation_days
      used_vacation_days = user.used_vacation_days(Vacation.all)
      expect(response.body).to be_json_eql({ vacations: vacation_response(Vacation.all), available_vacation_days: available_vacation_days, used_vacation_days: used_vacation_days }.to_json)
    end

    it 'filters user vacation applications by year' do
      sign_in(user)
      create(:vacation, user: user)
      get :index, params: { year: (Time.current - 1.year).year }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql({ vacations: [], available_vacation_days: 0, used_vacation_days: used_vacation_days_response }.to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    context 'creates vacation' do
      it 'with valid params' do
        sign_in(user)
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
      expect(response.body).to be_json_eql(vacation.attributes.slice('id', 'start_date', 'end_date', 'vacation_type', 'status', 'description', 'vacation_sub_type')
                                                              .merge(full_name: vacation.user.to_s, approvers: '', decliners: '', interacted: nil, available_vacation_days: 0).to_json)
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
        create(:vacation_period, user: user)
        accepted_vacation = create(:vacation, user: user, description: 'Accepted', status: :accepted)
        unconfirmed_vacation = create(:vacation, user: user, description: 'Unconfirmed')
        expect(VacationApplicationsQuery).to receive(:new).with(staff_manager, default_params.merge(action: 'vacation_applications')).and_return(vacation_applications_query)
        expect(vacation_applications_query).to receive(:accepted_or_declined_vacations).and_return([accepted_vacation])
        expect(vacation_applications_query).to receive(:unconfirmed_vacations).and_return([unconfirmed_vacation])
        get :vacation_applications, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql({ accepted_or_declined_vacations: [vacation_response_with_description(accepted_vacation).merge(full_name: nil)],
                                               unconfirmed_vacations: [unconfirmed_vacation_response(unconfirmed_vacation).merge(available_vacation_days: 24)] }.to_json)
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
                                             vacation: vacation_response_with_description(vacation.reload).merge(full_name: user.to_s),
                                             previous_status: 'unconfirmed' }.to_json)
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
                                             vacation: vacation_response_with_description(vacation.reload).merge(full_name: user.to_s),
                                             previous_status: 'unconfirmed' }.to_json)
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
                                             vacation: vacation_response_with_description(vacation.reload).merge(full_name: user.to_s),
                                             previous_status: 'accepted' }.to_json)
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
      expect(response.header['Content-Disposition']).to eql('attachment; filename="vacations_report.csv"')
    end
  end
end
