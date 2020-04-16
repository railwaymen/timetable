# frozen_string_literal: true

require 'sidekiq/web'
require 'sidekiq-status/web'

Rails.application.routes.draw do
  root to: 'home#index'
  devise_for :users
  authenticate :user, ->(u) { u.admin? } do
    mount Sidekiq::Web => '/jobs'
  end

  namespace :api do
    devise_for :users, controllers: { sessions: 'api/sessions' }

    resources :docs, only: :index
    namespace :public do
      resources :metrics
    end
    namespace :reports do
      resources :work_times do
        get :by_users, on: :collection
      end
    end
    resources :users, only: %i[index show create update] do
      get :incoming_birthdays, on: :collection
    end
    resources :accounting_periods do
      collection do
        get :next_position
        get :matching_fulltime
        post :recount
        get :recount_status, to: 'accounting_periods_recounts#status'
        post :generate
      end
    end
    resources :work_times do
      post :create_filling_gaps, on: :collection
    end
    resources :projects, only: %i[index show create update] do
      resources :project_reports, except: %i[delete] do
        get :roles, on: :collection
        put :generate, on: :member
        get :file, on: :member
        get :synchronize, on: :member
      end
      resources :combined_reports, shallow: true, only: %i[index show create destroy]
      get :list, on: :collection
      get :simple, on: :collection
      get :tags, on: :collection
      get :work_times, on: :member
    end
    resources :external_auths, only: %i[new create destroy]
    resources :vacations do
      get :vacation_applications, on: :collection
      post :decline
      post :approve
      put :undone
      get :generate_csv, on: :collection
      put :self_decline
      get :generate_yearly_report, on: :collection
    end
    resources :vacation_periods, only: %i[index show update] do
      post :generate, on: :collection
    end
    resources :remote_works, only: %i[index create destroy update]
    resources :birthday_email_templates do
      put :set_last_used
    end
    resources :project_resources do
      get :activity, on: :collection
    end
    resources :project_resource_assignments
  end

  resources :reports, only: [] do
    get :project, on: :collection
  end

  get '/'         => 'home#index', constraints: { format: :html }
  get '*url'      => 'home#index', constraints: { format: :html }
end
