# frozen_string_literal: true

module Reports
  module Efficiency
    module Querable
      include Enumerable

      delegate :each, :empty?, to: :records

      def [](row = 0)
        records[row]
      end
    end
  end
end
