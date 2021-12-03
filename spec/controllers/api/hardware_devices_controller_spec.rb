# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::HardwareDevicesController do
  describe '#index' do
    context 'when user is employee' do
      it 'returns all user hardwares' do
        user = create(:user)
        create_list(:hardware_device, 2, user: user)
        sign_in user

        get :index, params: { format: 'json' }
        expect(response.code).to eq '403'
        expect(response.body).to eq('')
      end
    end

    context 'when user is hardware manager' do
      it 'returns all hardwares' do
        admin = create(:user, :hardware_manager)
        create_list(:hardware_device, 2)
        sign_in admin

        get :index, params: { format: 'json' }
        expect(JSON.parse(response.body)['records'].count).to eq(2)
      end
    end
  end

  describe '#show' do
    context 'when user is employee' do
      it 'returns all user hardwares' do
        user = create(:user)
        sign_in user

        get :show, params: { id: 1, format: 'json' }
        expect(response.code).to eq '403'
        expect(response.body).to eq('')
      end
    end

    context 'when user is hardware manager' do
      it 'returns all hardwares' do
        admin = create(:user, :hardware_manager)
        hardware = create(:hardware_device)
        sign_in admin

        expected_response = {
          id: hardware.id,
          category: hardware.category,
          brand: hardware.brand,
          model: hardware.model,
          price: hardware.price,
          serial_number: hardware.serial_number,
          year_of_production: hardware.year_of_production,
          year_bought: hardware.year_bought,
          used_since: hardware.used_since,
          cpu: hardware.cpu,
          device_type: hardware.device_type,
          ram: hardware.ram,
          user_id: hardware.user_id,
          storage: hardware.storage,
          os_version: hardware.os_version,
          state: hardware.state,
          note: hardware.note,
          invoice: hardware.invoice,
          archived: hardware.archived,
          user: hardware.user,
          images: []
        }.as_json

        get :show, params: { id: hardware.id, format: 'json' }
        expect(JSON.parse(response.body)).to eq(expected_response)
      end
    end
  end

  describe '#history' do
    context 'when user is employee' do
      it 'returns all user hardwares' do
        user = create(:user)
        hardware = create(:hardware_device)
        sign_in user

        get :history, params: { id: hardware.id, format: 'json' }
        expect(response.code).to eq '403'
        expect(response.body).to eq('')
      end
    end

    context 'when user is hardware manager' do
      it 'returns all hardwares' do
        admin = create(:user, :hardware_manager)
        hardware = create(:hardware_device)
        hardware.update!(brand: 'A')
        hardware.update!(brand: 'B')

        sign_in admin

        get :history, params: { id: hardware.id, format: 'json' }
        expect(response.code).to eq('200')
      end
    end
  end

  describe '#archived' do
    context 'when user is employee' do
      it 'returns all user hardwares' do
        user = create(:user)
        create_list(:hardware_device, 2, user: user)
        FactoryBot.create(:hardware_device, user: user, archived: true)
        sign_in user

        get :archived, params: { format: 'json' }
        expect(response.code).to eq '403'
        expect(response.body).to eq('')
      end
    end

    context 'when user is hardware manager' do
      it 'returns all hardwares' do
        admin = create(:user, :hardware_manager)
        create_list(:hardware_device, 2, user: admin)
        create(:hardware_device, user: admin, archived: true)
        sign_in admin

        get :archived, params: { format: 'json' }
        expect(JSON.parse(response.body)['records'].count).to eq(1)
      end
    end
  end

  describe '#rental_agreement' do
    context 'agreement_type is equal to rental' do
      context 'with accessories' do
        it 'correctly create pdf' do
          lender = FactoryBot.create(:lender)
          hardware_device = FactoryBot.create(:hardware_device, :with_accessories)

          sign_in(FactoryBot.create(:user, :admin))

          get :rental_agreement, params: { id: hardware_device.id, lender_id: lender.id, type: :rental }

          expect(response.code).to eq('200')
        end
      end

      context 'without accessories' do
        it 'correctly create pdf' do
          lender = FactoryBot.create(:lender)
          hardware_device = FactoryBot.create(:hardware_device)

          sign_in(FactoryBot.create(:user, :admin))

          get :rental_agreement, params: { id: hardware_device.id, lender_id: lender.id, type: :rental }

          expect(response.code).to eq('200')
        end
      end
    end

    context 'agreement_type is equal to return' do
      context 'with accessories' do
        it 'correctly create pdf' do
          lender = FactoryBot.create(:lender)
          hardware_device = FactoryBot.create(:hardware_device, :with_accessories)

          sign_in(FactoryBot.create(:user, :admin))

          get :rental_agreement, params: { id: hardware_device.id, lender_id: lender.id, type: :return }

          expect(response.code).to eq('200')
        end
      end

      context 'without accessories' do
        it 'correctly create pdf' do
          lender = FactoryBot.create(:lender)
          hardware_device = FactoryBot.create(:hardware_device)

          sign_in(FactoryBot.create(:user, :admin))

          get :rental_agreement, params: { id: hardware_device.id, lender_id: lender.id, type: :return }

          expect(response.code).to eq('200')
        end
      end
    end
  end

  describe '#update' do
    context 'when user is normal user' do
      it "doesn't update hardware" do
        user = create(:user)
        hardware = create(:hardware_device, user: user)
        sign_in user

        params = {
          format: 'json',
          id: hardware.id,
          hardware_device: { serial_number: 'SERIAL' }
        }

        put :update, params: params

        hardware.reload

        expect(hardware.serial_number).not_to eq 'SERIAL'
        expect(response.code).to eq '403'
      end
    end

    context 'when user is hardware manager' do
      context 'when parameters are correct' do
        it 'updates hardware' do
          user = create(:user, :hardware_manager)
          hardware = create(:hardware_device, user: user)
          sign_in user

          params = {
            format: 'json',
            id: hardware.id,
            hardware_device: { serial_number: 'SERIAL' }
          }

          put :update, params: params
          expect(hardware.reload.serial_number).to eq('SERIAL')
        end
      end

      context 'when parameters are incorrect' do
        it 'won\'t update hardware' do
          user = create(:user, :hardware_manager)
          hardware = create(:hardware_device, user: user)
          sign_in user

          params = {
            format: 'json',
            id: hardware.id,
            hardware_device: { serial_number: nil, brand: nil }
          }

          put :update, params: params
          expect(hardware.reload.serial_number).not_to eq(nil)
        end
      end
    end
  end

  describe '#create' do
    context 'when user is hardware manager' do
      context 'when parameters are correct' do
        it 'creates hardware' do
          user = create(:user, :hardware_manager)
          sign_in user
          params = {
            format: 'json',
            hardware_device: {
              category: 'computers',
              brand: 'TechA',
              model: 'Test',
              serial_number: 'SMSRLNMBR',
              year_of_production: '2021-02-22',
              year_bought: '2021-02-22',
              used_since: '2021-02-22',
              state: 'poor',
              os_version: '10.0',
              device_type: 'MyType',
              user_id: user.id
            }
          }

          expect { post :create, params: params }
            .to change { HardwareDevice.count }.by(1)
        end
      end

      context 'when parameters are not correct' do
        it 'creates hardware' do
          user = create(:user, :hardware_manager)
          sign_in user
          params = {
            format: 'json',
            hardware_device: {
              user_id: user.id
            }
          }

          expect { post :create, params: params }
            .to change { HardwareDevice.count }.by(0)
        end
      end
    end
  end

  describe '#destroy' do
    context 'when user is hardware manager' do
      context 'when device is not archived' do
        it 'move hardware to archived' do
          user = create(:user, :hardware_manager)
          hardware = create(:hardware_device, user: user, archived: false)
          sign_in user

          params = { format: 'json', id: hardware.id }
          delete :destroy, params: params

          hardware.reload

          expect(hardware.archived).to eq(true)
        end
      end

      context 'when device is archived' do
        it 'removes device' do
          user = create(:user, :hardware_manager)
          hardware = create(:hardware_device, user: user, archived: true)
          sign_in user

          params = { format: 'json', id: hardware.id }

          expect do
            delete :destroy, params: params
          end.to change(HardwareDevice, :count).by(0)
          expect(hardware.reload.discarded_at).to_not be_nil
        end
      end
    end
  end
end
