# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SearchQuery do
  describe 'custom sql function' do
    it 'correctly filter through function' do
      hardware1 = FactoryBot.create(:hardware_device, brand: 'ExampleName', model: 'AAB', used_since: Time.current - 5.days)
      FactoryBot.create(:hardware_device, brand: 'BrandName', model: 'AAD')
      hardware3 = FactoryBot.create(:hardware_device, brand: 'ExampleTest', model: 'BBX')

      date_phrase = (Time.current - 5.days).strftime('%Y-%m-%d')
      phrase = %W[example AAB #{date_phrase}]

      scope = HardwareDevice.all
      query = described_class
              .new(scope)
              .ilike(
                values: phrase,
                names: %w[brand model]
              )
              .custom(
                sql_function: 'to_char',
                sql_function_args: [
                  { type: 'table', value: 'hardware_devices.used_since' },
                  { type: 'string', value: 'YYYY-MM-DD' }
                ],
                value: date_phrase
              )

      results = query.execute.order(search_strength: :desc)

      values = results.map { |e| [e.id, e.search_strength] }

      expect(values[0]).to eq([hardware1.id, 3])
      expect(values[1]).to eq([hardware3.id, 1])

      expect(values.length).to eq(2)
    end

    it 'correctly protects from sql injection in param' do
      hardware1 = FactoryBot.create(:hardware_device, brand: 'ExampleName', model: 'AAB', used_since: Time.current - 5.days)
      FactoryBot.create(:hardware_device, brand: 'BrandName', model: 'AAD')
      hardware3 = FactoryBot.create(:hardware_device, brand: 'ExampleTest', model: 'BBX')

      date_phrase = '-- DROP DATABASE;'
      phrase = %W[example AAB #{date_phrase}]

      scope = HardwareDevice.all
      query = described_class
              .new(scope)
              .ilike(
                values: phrase,
                names: %w[brand model]
              )
              .custom(
                sql_function: 'to_char',
                sql_function_args: [
                  { type: 'table', value: 'hardware_devices.used_since' },
                  { type: 'string', value: 'YYYY-MM-DD' }
                ],
                value: date_phrase
              )

      results = query.execute.order(search_strength: :desc)

      values = results.map { |e| [e.id, e.search_strength] }

      expect(values[0]).to eq([hardware1.id, 2])
      expect(values[1]).to eq([hardware3.id, 1])

      expect(values.length).to eq(2)
    end

    it 'correctly protects from sql injection in table' do
      FactoryBot.create(:hardware_device, brand: 'ExampleName', model: 'AAB', used_since: Time.current - 5.days)
      FactoryBot.create(:hardware_device, brand: 'BrandName', model: 'AAD')
      FactoryBot.create(:hardware_device, brand: 'ExampleTest', model: 'BBX')

      date_phrase = '123'
      phrase = %W[example AAB #{date_phrase}]

      scope = HardwareDevice.all
      expect do
        described_class
          .new(scope)
          .ilike(
            values: phrase,
            names: %w[brand model]
          )
          .custom(
            sql_function: 'to_char',
            sql_function_args: [
              { type: 'table', value: '-- DROP DATABASE;' },
              { type: 'string', value: 'YYYY-MM-DD' }
            ],
            value: date_phrase
          )
      end.to raise_error(StandardError)
    end
  end

  describe 'search_strengh' do
    context 'when correctly added columns' do
      it 'correctly calculalte the search strength dependent on value' do
        hardware1 = FactoryBot.create(:hardware_device, brand: 'ExampleName', model: 'AAB')
        FactoryBot.create(:hardware_device, brand: 'BrandName', model: 'AAD')
        hardware3 = FactoryBot.create(:hardware_device, brand: 'ExampleTest', model: 'BBX')

        scope = HardwareDevice.all
        query = described_class
                .new(scope)
                .ilike(
                  values: %w[example AAB],
                  names: %w[brand model]
                )

        results = query.execute.order(search_strength: :desc)

        values = results.map { |e| [e.id, e.search_strength] }

        expect(values[0]).to eq([hardware1.id, 2])
        expect(values[1]).to eq([hardware3.id, 1])

        expect(values.length).to eq(2)
      end
    end

    context 'when incorrectly added columns' do
      it 'raise an error' do
        scope = HardwareDevice.all

        expect do
          described_class
            .new(scope)
            .ilike(
              values: ['example'],
              names: ['incorrect_column_name']
            )
        end.to raise_error(StandardError)
      end
    end
  end
end
