# frozen_string_literal: true

json.partial! 'tag', tag: @tag
json.edit @tag.work_times.kept.empty?
