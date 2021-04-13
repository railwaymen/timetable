# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HardwareDevice, type: :model do
  it { is_expected.to validate_presence_of(:brand) }
  it { is_expected.to validate_presence_of(:model) }
  it { is_expected.to validate_presence_of(:serial_number) }
  it { is_expected.to validate_presence_of(:year_of_production) }
  it { is_expected.to validate_presence_of(:year_bought) }
  it { is_expected.to validate_presence_of(:category) }

  describe 'unique_serial_number' do
    it 'add serial number exists error when there is serial number duplication' do
      FactoryBot.create(:hardware_device, serial_number: 'SMSRLNMBR')
      hardware = FactoryBot.build(:hardware_device, serial_number: 'SMSRLNMBR')

      expect(hardware.valid?).to eq false
      expect(hardware.errors.messages).to eq(
        serial_number: ['serial_number_exists']
      )
    end
  end

  describe 'search' do
    it 'calls a search_query' do
      mock_search = double

      expect(mock_search).to receive(:custom).and_return(mock_search)
      expect(mock_search).to receive(:ilike).and_return(mock_search)
      expect(mock_search).to receive(:execute).and_return(mock_search)
      expect(SearchQuery).to receive(:new).and_return(mock_search)

      HardwareDevice.search('phrase')
    end
  end
end
