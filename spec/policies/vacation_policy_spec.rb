# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationPolicy, type: :policy do
  permissions '.scope' do
    context 'admin user' do
      it 'returns all records' do
        vacation = create(:vacation)

        expect(described_class::Scope.new(build_stubbed(:user, :admin), Vacation).resolve).to match_array [vacation]
      end
    end

    context 'leader user' do
      it 'returns all records' do
        vacation = create(:vacation)

        user = build_stubbed(:user)
        expect(user).to receive(:leader?).and_return(true)

        expect(described_class::Scope.new(user, Vacation).resolve).to match_array [vacation]
      end
    end

    context 'regular user' do
      it 'returns only user records' do
        user = create(:user)

        user_vacation = create(:vacation, user: user)
        create(:vacation)

        expect(described_class::Scope.new(user, Vacation).resolve).to match_array [user_vacation]
      end
    end
  end
end
