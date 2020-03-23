# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::RemoteWorksController do
  render_views
  let(:user) { create(:user) }
  let(:admin) { create(:admin) }

  def remote_work_response(remote_work)
    remote_work.attributes.slice('id', 'user_id', 'creator_id', 'starts_at', 'ends_at', 'duration', 'note',
                                 'updated_by_admin')
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it "returns user's remote works" do
      sign_in(user)

      remote_work = create(:remote_work, user: user)
      get :index, params: { user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ remote_works: [remote_work_response(remote_work)], total_count: 1 }.to_json)
    end

    it 'checks permissions' do
      sign_in(user)

      create(:remote_work, user: admin)
      get :index, params: { user_id: admin.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ remote_works: [], total_count: 0 }.to_json)
    end

    it 'filters by user_id as admin' do
      sign_in(admin)

      remote_work = create(:remote_work, user: user)
      get :index, params: { user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ remote_works: [remote_work_response(remote_work)], total_count: 1 }.to_json)
    end
  end
end
