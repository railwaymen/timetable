# frozen_string_literal: true

json.extract! tag, :id, :name, :project_id
json.active tag.kept?
json.global tag.project_id.nil?
json.project_name tag.project&.name
