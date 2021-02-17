# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::HardwaresController do
  let(:user) { create(:user) }

  describe '#index' do
    context 'when user is employee' do
      it 'returns all user hardwares' do
        create_list(:hardware, 2, user: user)
        sign_in user

        get :index, params: { format: 'json' }
        expect(JSON.parse(response.body).count).to eq(2)
      end
    end

    context 'when user is hardware manager' do
      it 'returns all hardwares' do
        admin = create(:user, :hardware_manager)
        create_list(:hardware, 2)
        sign_in admin

        get :index, params: { format: 'json' }
        expect(JSON.parse(response.body).count).to eq(2)
      end
    end
  end

  describe '#types' do
    it 'returns all hardware types' do
      sign_in user

      get :types, params: { format: 'json' }
      expected_response = { types: Hardware.types.keys }.stringify_keys
      expect(JSON.parse(response.body)).to eq(expected_response)
    end
  end

  describe '#update' do
    context 'when hardware is locked' do
      context 'when user is normal user' do
        it "doesn't update hardware" do
          hardware = create(:hardware, user: user, locked: true)
          sign_in user

          params = {
            format: 'json',
            id: hardware.id,
            hardware: { serial_number: 'SERIAL' }
          }

          expect { put(:update, params: params) }.to raise_error(Pundit::NotAuthorizedError)
        end
      end

      context 'when user is hardware manager' do
        it 'updates hardware' do
          user = create(:user, :hardware_manager)
          hardware = create(:hardware, user: user, locked: true)
          sign_in user

          params = {
            format: 'json',
            id: hardware.id,
            hardware: { serial_number: 'SERIAL' }
          }

          put :update, params: params
          expect(hardware.reload.serial_number).to eq('SERIAL')
        end
      end
    end

    context 'when hardware is unlocked' do
      it 'updates hardware' do
        hardware = create(:hardware, user: user, locked: false)
        sign_in user

        params = {
          format: 'json',
          id: hardware.id,
          hardware: { serial_number: 'SERIAL' }
        }

        put :update, params: params
        expect(hardware.reload.serial_number).to eq('SERIAL')
      end
    end
  end

  describe '#create' do
    it 'creates hardware' do
      sign_in user
      params = {
        format: 'json',
        hardware: {
          model: 'model',
          manufacturer: 'manufacturer',
          serial_number: 'serial_number',
          type: 'laptop',
          user: user,
          physical_condition: 'good',
          functional_condition: 'good'
        }
      }

      expect { post :create, params: params }
        .to change { Hardware.count }.by(1)
    end
  end

  describe '#destroy' do
    it 'destroies hardware' do
      hardware = create(:hardware, user: user)
      sign_in user

      params = { format: 'json', id: hardware.id }
      expect { delete :destroy, params: params }
        .to change { Hardware.count }.by(-1)
    end
  end

  describe '#bulk_update' do
    context 'when user is normal user' do
      let(:user_hardware) { create(:hardware, user: user) }
      let(:user2) { create(:user) }
      let(:user2_hardware) { create(:hardware, user: user2) }

      it 'updates status only for personal hardwares' do
        sign_in user
        params = {
          format: 'json',
          selected_hardwares: [user_hardware.id, user2_hardware.id],
          hardware: { status: :loaning }
        }

        expect { put :bulk_update, params: params }
          .to_not(change { user2_hardware.reload.status })
        expect(user_hardware.reload.status).to eql('loaning')
      end
    end

    context 'when user is hardware manager' do
      let(:hardware_manager) { create(:user, :hardware_manager) }
      let(:user_hardware) { create(:hardware, user: user, status: :loaning) }
      let(:hardware_manager_hardware) { create(:hardware, user: hardware_manager, status: :loaning) }

      it 'updates status and locked status for all selected hardwares' do
        sign_in hardware_manager
        params = {
          format: 'json',
          selected_hardwares: [user_hardware.id, hardware_manager_hardware.id],
          hardware: { status: :loaned, locked: true }
        }

        put :bulk_update, params: params
        expect(Hardware.all.pluck(:status).uniq).to eql(['loaned'])
        expect(Hardware.all.pluck(:locked).uniq).to eql([true])
      end
    end

    it 'returns error when status transition is wrong (eg. trying to loan already loaned hardware)' do
      I18n.locale = :pl
      user_hardware = create(:hardware, user: user)
      sign_in user
      loaned_hardware = create(:hardware, user: user, status: :loaned)

      params = {
        format: 'json',
        selected_hardwares: [user_hardware.id, loaned_hardware.id],
        hardware: { status: :loaning }
      }

      expect put :bulk_update, params: params
      response_body = JSON.parse(response.body)
      expect(response_body['errors']).to eql(["Status #{I18n.t('activerecord.errors.models.hardware.attributes.status.wrong_transition')}"])
      expect(user_hardware.reload.status).to eql('in_office')
      expect(loaned_hardware.reload.status).to eql('loaned')
    end
  end

  describe '#bulk_destroy' do
    let(:hardware_manager) { create(:user, :hardware_manager) }
    let(:user_hardware) { create(:hardware, user: user, status: :loaning) }
    let(:hardware_manager_hardware) { create(:hardware, user: hardware_manager, status: :loaning) }
    let!(:params) { { format: 'json', selected_hardwares: "#{user_hardware.id},#{hardware_manager_hardware.id}" } }

    context 'when user is normal user' do
      it 'deletes only user hardwares' do
        sign_in user

        expect { delete :bulk_destroy, params: params }
          .to change { Hardware.count }.by(-1)
        expect(Hardware.all.pluck(:user_id)).to eql([hardware_manager.id])
      end
    end

    context 'when user is hardware manager' do
      it 'deletes selected hardwares' do
        sign_in hardware_manager

        expect { delete :bulk_destroy, params: params }
          .to change { Hardware.count }.by(-2)
      end
    end
  end

  describe '#rental_agreement' do
    it 'generates rental_agreement' do
      hardware = create(:hardware, user: user)
      sign_in user

      params = {
        format: 'json',
        ids: hardware.id.to_s,
        company: 'Company',
        lender: 'John Smith'
      }
      generator = instance_double('Agreements::RentalAgreementGeneratorService')

      expect(Agreements::RentalAgreementGeneratorService).to receive(:new).and_return(generator)
      expect(generator).to receive(:generate)

      get :rental_agreement, params: params
    end
  end

  describe '#return_agreement' do
    it 'generates return_agreement' do
      hardware = create(:hardware, user: user)
      sign_in user

      params = {
        format: 'json',
        ids: hardware.id.to_s,
        company: 'Company',
        lender: 'John Smith'
      }
      generator = instance_double('Agreements::ReturnAgreementGeneratorService')

      expect(Agreements::ReturnAgreementGeneratorService).to receive(:new).and_return(generator)
      expect(generator).to receive(:generate)

      get :return_agreement, params: params
    end
  end

  describe '#change_status' do
    it 'forbids regular user' do
      sign_in user
      put :change_status, params: { hardware_id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'changes status bypassing wrong transitions' do
      hardware_manager = create(:user, :hardware_manager)
      hardware = create(:hardware, user: user)
      sign_in hardware_manager

      expect { put :change_status, params: { hardware_id: hardware.id, hardware: { status: 'loaned' } }, format: :json }
        .to change { hardware.reload.status }.from('in_office').to('loaned')
    end
  end
end
