# frozen_string_literal: true

class CustomFailureApp < Devise::FailureApp
  def respond
    if request.format == :json && warden_message == :inactive
      inactive_error_response
    else
      super
    end
  end

  def inactive_error_response
    self.status = 422
    self.content_type = 'application/json'
    self.response_body = {
      errors: {
        base: [
          { error: warden_message }
        ]
      }
    }.to_json
  end
end
