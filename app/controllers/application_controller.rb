# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  include Pundit

  protect_from_forgery with: :exception
  around_action :use_user_locale
  before_action :set_raven_context

  helper_method :current_user

  def authenticate_admin!
    authenticate_user!
    return head(:forbidden) unless current_user.admin?
  end

  def use_user_locale(&block)
    I18n.with_locale(current_user.try(:lang), &block)
  end

  def authenticate_admin_or_manager_or_leader!
    authenticate_user!
    return head(:forbidden) unless current_user.admin? || current_user.manager? || current_user.leader?
  end

  def authenticate_admin_or_hardware_manager!
    authenticate_user!
    return head(:forbidden) unless current_user.admin? || current_user.hardware_manager?
  end

  def authenticate_admin_or_manager!
    authenticate_user!
    return head(:forbidden) unless current_user.admin? || current_user.manager?
  end

  def disable_paper_trail
    PaperTrail.request.enabled = false
    yield
    PaperTrail.request.enabled = true
  end

  private

  def set_raven_context
    Raven.user_context(id: current_user&.id)
    Raven.extra_context(params: params.to_unsafe_h, url: request.url)
  end
end
