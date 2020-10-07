# frozen_string_literal: true

json.extract! tag, :id, :name, :project_id
json.active tag.kept?
json.global tag.project_id.nil?
json.edit tag.work_times.kept.exists?
json.project_name tag.project&.name
