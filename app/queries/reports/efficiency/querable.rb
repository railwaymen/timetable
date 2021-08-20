# frozen_string_literal: true

module Reports
  module Efficiency
    module Querable
      delegate :each, :empty?, to: :records
    end
  end
end
