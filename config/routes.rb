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
    resources :users, only: %i[index show create update]
    resources :hardwares, only: %i[index create destroy update] do
      get :types, on: :collection
      resources :fields, controller: :hardware_fields, only: %i[create destroy update]
      get :rental_agreement, on: :collection
      get :return_agreement, on: :collection
      put :change_status
      resources :accessories, controller: :hardware_accessories, only: %i[create destroy update]
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
      get :search, on: :collection
    end
    resources :tags, only: %i[index show create update]
    resources :projects, only: %i[index show create update] do
      resources :milestones do
        get :work_times, on: :collection
        post :import, on: :collection
        get :import_status, on: :collection
        resources :estimates, only: [:index], controller: :milestone_estimates
      end
      resources :project_reports, except: %i[delete] do
        get :roles, on: :collection
        put :generate, on: :member
        put :refresh, on: :member
        get :file, on: :member
        get :synchronize, on: :member
      end
      resources :combined_reports, shallow: true, only: %i[index show create destroy] do
        get :synchronize, on: :member
        get :file, on: :member
      end
      get :current_milestones, on: :collection
      get :stats, on: :collection
      get :simple, on: :collection
      get :with_tags, on: :collection
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
      post :update_dates
    end
    resources :vacation_periods, only: %i[index show update] do
      post :generate, on: :collection
    end
    resources :remote_works, only: %i[index create destroy update]
    resources :project_resources do
      get :activity, on: :collection
    end
    resources :project_resource_assignments
    delete :hardwares_bulk_destroy, to: 'hardwares#bulk_destroy'
    put :hardwares_bulk_update, to: 'hardwares#bulk_update'
    resources :companies, only: %i[index]
  end

  resource :efficiency_reports, only: :show

  resources :reports, only: [] do
    get :project, on: :collection
  end

  get '/' => 'home#index', :constraints => { format: :html }
  get '*url' => 'home#index', :constraints => { format: :html }
end
