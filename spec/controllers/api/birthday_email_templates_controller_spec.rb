# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::BirthdayEmailTemplatesController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }

  describe 'GET #index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      get :index, format: :json
      expect(response.code).to eql('403')
    end

    it 'returns birthday email templates' do
      sign_in(admin)
      template = create :birthday_email_template
      get :index, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([template.attributes.slice('header', 'body', 'bottom', 'title', 'name', 'last_used')].to_json)
    end
  end

  describe 'GET #show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      get :show, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'returns birthday email template' do
      sign_in(admin)
      template = create :birthday_email_template
      get :show, params: { id: template.id }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(template.attributes.slice('id', 'header', 'body', 'bottom', 'title', 'last_used', 'name').to_json)
    end
  end

  describe 'POST #create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      post :create, format: :json
      expect(response.code).to eql('403')
    end

    it 'creates birthday email template' do
      sign_in(admin)
      post :create, params: { birthday_email_template: { name: 'Name', title: 'Title', body: 'Body' } }, format: :json

      expect(response.code).to eql('200')
      template = BirthdayEmailTemplate.first
      expect(response.body).to be_json_eql(template.attributes.slice('id', 'header', 'body', 'bottom', 'title', 'last_used', 'name').to_json)
    end
  end

  describe 'PUT #update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'updates bithday email template' do
      sign_in(admin)
      template = create :birthday_email_template
      put :update, params: { id: template.id, birthday_email_template: { name: 'New name' } }, format: :json

      expect(response.code).to eql('200')
      expect(template.reload.name).to eql('New name')
    end
  end

  describe 'DELETE #destroy' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'deletes birthday email template' do
      sign_in(admin)
      template = create :birthday_email_template

      expect { delete :destroy, params: { id: template.id }, format: :json }
        .to change { BirthdayEmailTemplate.count }.from(1).to(0)
    end
  end

  describe 'PUT #set_last_used' do
    it 'authenticates user' do
      put :set_last_used, params: { birthday_email_template_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      put :set_last_used, params: { birthday_email_template_id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'sets last_used attribute to true for given template' do
      sign_in(admin)
      template = create :birthday_email_template

      expect { put :set_last_used, params: { birthday_email_template_id: template.id }, format: :json }
        .to change { template.reload.last_used }.from(false).to(true)
    end
  end
end
