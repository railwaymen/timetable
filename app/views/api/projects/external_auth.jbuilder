# frozen_string_literal: true

json.project do
  json.partial! 'project', project: @project
end
if @external_auth
  json.auth do
    json.partial! 'api/external_auths/external_auth', external_auth: @external_auth
  end
end
json.public_key IO.read(Rails.application.secrets.public_key_location)
