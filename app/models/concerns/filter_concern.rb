# frozen_string_literal: true

module FilterConcern
  extend ActiveSupport::Concern

  class_methods do
    def filter_by(action)
      case action
      when :active then kept
      when :inactive then discarded
      else all
      end
    end
  end
end
