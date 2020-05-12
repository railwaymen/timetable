# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::HardwareFieldsController do
  describe '#create' do
    it 'creates hardware field for hardware' do
      hardware = create(:hardware)
      user = create(:user)
      sign_in user

      params = {
        format: 'json',
        hardware_id: hardware.id,
        field: { name: 'Field1', value: 'Value1' }
      }

      expect { post :create, params: params }
        .to change { HardwareField.count }.by(1)
    end
  end

  describe '#update' do
    it 'updates hardware field' do
      field = create(:hardware_field)
      user = create(:user)

      sign_in user

      params = {
        format: 'json',
        hardware_id: field.hardware_id,
        id: field.id,
        field: {
          name: 'NewField',
          value: 'NewValue'
        }
      }

      put :update, params: params

      expect(field.reload.name).to eq('NewField')
    end
  end

  describe '#destroy' do
    it 'destories hardware field' do
      field = create(:hardware_field)
      user = create(:user)

      sign_in user

      params = {
        format: 'json',
        id: field.id,
        hardware_id: field.hardware_id
      }

      expect { delete :destroy, params: params }
        .to change { HardwareField.count }.by(-1)
    end
  end
end
