# frozen_string_literal: true

json.call @tag, :id, :name
json.active @tag.kept?
json.project_name @tag.project.name
