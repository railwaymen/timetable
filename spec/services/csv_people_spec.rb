# frozen_string_literal: true

require 'rails_helper'
require 'csv'

RSpec.describe CsvPeople do
  let!(:active_user) { create(:user) }
  let!(:inactive_user) { create(:user, :discarded) }

  describe '#generate' do
    context 'when filter all' do
      it 'create csv with all users' do
        csv_people = described_class.new(filter: 'all')

        csv = CSV.parse(csv_people.generate)

        expect(csv.length).to eql(3)
      end
    end

    context 'when filter active' do
      it 'create csv with active users' do
        csv_people = described_class.new(filter: 'active')

        csv = CSV.parse(csv_people.generate)

        expect(csv.length).to eql(2)
      end
    end

    context 'when filter inactive' do
      it 'create csv with inactive users' do
        csv_people = described_class.new(filter: 'inactive')

        csv = CSV.parse(csv_people.generate)

        expect(csv.length).to eql(2)
      end
    end

    context 'when filter missing' do
      it 'create csv with active users' do
        csv_people = described_class.new

        csv = CSV.parse(csv_people.generate)

        expect(csv.length).to eql(2)
      end
    end
  end

  describe '#filename' do
    it 'returns filename' do
      csv_people = described_class.new

      expect(csv_people.filename).to eql('people.csv')
    end
  end
end
