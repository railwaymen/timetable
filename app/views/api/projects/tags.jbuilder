# frozen_string_literal: true

json.array! TAGS_DISABLED ? [] : @tags.keys
