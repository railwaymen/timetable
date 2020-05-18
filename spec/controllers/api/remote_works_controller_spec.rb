# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::RemoteWorksController do
  let(:user) { create(:user) }
  let(:admin) { create(:admin) }
  let(:starts_at) do
    Time.zone.today.workday? ? Time.zone.now.beginning_of_day + 9.hours : 1.business_day.from_now.beginning_of_day + 9.hours
  end
  let(:ends_at) { starts_at + 8.hours }

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
      expect(response.body).to be_json_eql({ records: [remote_work_response(remote_work)], total_pages: 1 }.to_json)
    end

    it 'checks permissions' do
      sign_in(user)

      create(:remote_work, user: admin)
      get :index, params: { user_id: admin.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ records: [], total_pages: 0 }.to_json)
    end

    it 'filters by user_id as admin' do
      sign_in(admin)

      remote_work = create(:remote_work, user: user)
      get :index, params: { user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ records: [remote_work_response(remote_work)], total_pages: 1 }.to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      get :create, format: :json
      expect(response.code).to eql('401')
    end

    context 'single day' do
      it 'creates remote work' do
        sign_in(user)
        params = { note: 'note 1', starts_at: starts_at, ends_at: ends_at, user_id: user.id }
        post :create, params: { remote_work: params }, format: :json

        expect(response.code).to eql('200')
        remote_work = user.remote_works.first!
        expect(remote_work.starts_at).to eql(starts_at)
        expect(remote_work.ends_at).to eql(ends_at)
        expect(response.body).to be_json_eql([remote_work_response(remote_work)].to_json)
      end

      it 'creates remote work for other user by admin' do
        sign_in(admin)
        params = { starts_at: starts_at, ends_at: ends_at, user_id: user.id }
        post :create, params: { remote_work: params }, format: :json

        expect(response.code).to eql('200')
        remote_work = user.remote_works.first!
        expect(remote_work.user_id).to eql(user.id)
        expect(remote_work.creator_id).to eql(admin.id)
        expect(response.body).to be_json_eql([remote_work_response(remote_work)].to_json)
      end

      it 'does not create remote work when params are invalid' do
        sign_in(user)
        params = {
          starts_at: 5.business_days.before(starts_at),
          ends_at: 5.business_days.before(ends_at),
          user_id: user.id
        }

        expect do
          post :create, params: { remote_work: params }, format: :json
        end.not_to change(user.remote_works, :count)

        expect(response.code).to eql('422')
        expect(response.body).to include_json({ error: :too_old }.to_json).at_path('errors/starts_at')
      end
    end

    context 'many days' do
      it 'creates remote work entries' do
        sign_in(user)
        params = { starts_at: 2.business_days.before(starts_at), ends_at: ends_at, user_id: user.id }
        post :create, params: { remote_work: params }, format: :json

        expect(response.code).to eql('200')
        expect(user.remote_works.count).to eql(3)
        expect(response.body).to be_json_eql(RemoteWork.last(3).map(&method(:remote_work_response)).to_json)
      end

      it 'creates remote work entries for other user by admin' do
        sign_in(admin)
        params = { note: 'note 1', starts_at: 2.business_days.before(starts_at), ends_at: ends_at, user_id: user.id }
        post :create, params: { remote_work: params }, format: :json

        expect(response.code).to eql('200')
        expect(user.remote_works.count).to eql(3)
        expect(user.remote_works.pluck(:user_id).uniq).to eql([user.id])
        expect(user.remote_works.pluck(:creator_id).uniq).to eql([admin.id])
        expect(response.body).to be_json_eql(RemoteWork.last(3).map(&method(:remote_work_response)).to_json)
      end

      it 'does not create remote work entries when params are invalid' do
        sign_in(user)
        params = { note: 'note 1', starts_at: 5.business_days.before(starts_at), ends_at: ends_at, user_id: user.id }

        expect do
          post :create, params: { remote_work: params }, format: :json
        end.not_to change(user.remote_works, :count)

        expect(response.code).to eql('422')
        expect(response.body).to include_json({ error: :too_old }.to_json).at_path('errors/starts_at')
      end
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'updates remote work' do
      sign_in(user)
      remote_work = create(:remote_work, user: user, starts_at: starts_at, ends_at: ends_at)
      params = { note: 'note 2', starts_at: starts_at + 1.hour, ends_at: ends_at + 1.hour }
      put :update, params: { id: remote_work.id, remote_work: params }, format: :json

      expect(response.code).to eql('200')
      expect(remote_work.reload.starts_at).to eql(starts_at + 1.hour)
      expect(remote_work.ends_at).to eql(ends_at + 1.hour)
      expect(remote_work.note).to eql('note 2')
      expect(response.body).to be_json_eql(remote_work_response(remote_work).to_json)
    end

    it 'updates remote work of other user by admin' do
      sign_in(admin)
      remote_work = create(:remote_work, user: user, starts_at: starts_at, ends_at: ends_at)
      params = { note: 'note 2', starts_at: starts_at + 1.hour, ends_at: ends_at + 1.hour }
      put :update, params: { id: remote_work.id, remote_work: params }, format: :json

      expect(response.code).to eql('200')
      expect(remote_work.reload.starts_at).to eql(starts_at + 1.hour)
      expect(remote_work.ends_at).to eql(ends_at + 1.hour)
      expect(remote_work.note).to eql('note 2')
      expect(remote_work.updated_by_admin).to eql(true)
      expect(response.body).to be_json_eql(remote_work_response(remote_work).to_json)
    end

    it 'user cannot update remote work older than 3 business days' do
      sign_in(user)
      remote_work = create(:remote_work, user: user, starts_at: starts_at - 7.days, ends_at: ends_at - 7.days)
      params = { note: 'note 2', starts_at: starts_at - 8.days, ends_at: ends_at - 8.days }
      put :update, params: { id: remote_work.id, remote_work: params }, format: :json

      expect(response.code).to eql('422')
      expect(response.body).to include_json({ error: :too_old }.to_json).at_path('errors/starts_at')
    end
  end

  describe '#destroy' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'destroys remote work' do
      sign_in(user)
      remote_work = create(:remote_work, user: user, starts_at: starts_at, ends_at: ends_at)
      delete :destroy, params: { id: remote_work.id }, format: :json

      expect(response.code).to eql('204')
      expect(remote_work.reload.discarded?).to eql(true)
    end

    it 'destroys remote work of other user by admin' do
      sign_in(admin)
      remote_work = create(:remote_work, user: user, starts_at: starts_at - 7.days, ends_at: ends_at - 7.days)
      delete :destroy, params: { id: remote_work.id }, format: :json

      expect(response.code).to eql('204')
      expect(remote_work.reload.discarded?).to eql(true)
      expect(remote_work.updated_by_admin).to eql(true)
    end

    it 'user cannot destroy remote work older than 3 business days' do
      sign_in(user)
      remote_work = create(:remote_work, user: user, starts_at: starts_at - 15.days, ends_at: ends_at - 15.days)
      delete :destroy, params: { id: remote_work.id }, format: :json

      expect(response.code).to eql('422')
      expect(response.body).to include_json({ error: :too_old }.to_json).at_path('errors/starts_at')
    end
  end
end
