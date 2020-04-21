# frozen_string_literal: true

class ApiResponder < ActionController::Responder
  private

  def json_resource_errors
    { errors: resource.errors.details }
  end
end
