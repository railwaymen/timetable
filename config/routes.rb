require 'sidekiq/web'
require 'sidekiq-status/web'

TimeTable::Application.routes.draw do
  root to: 'home#index'
  devise_for :users
  authenticate :user, lambda { |u| u.admin? } do
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
    resources :accounting_periods do
      collection do
        get :next_position
        get :matching_fulltime
        post :recount
        get :recount_status, to: 'accounting_periods_recounts#status'
        post :generate
      end
    end
    resources :work_times
    resources :projects, only: %i[index show create update] do
      get :list, on: :collection
      get :simple, on: :collection
    end
  end

  resources :reports, only: [] do
    get :project, on: :collection
  end

  get '/'         => 'home#index', constraints: { format: :html }
  get '*url'      => 'home#index', constraints: { format: :html }
end
