# frozen_string_literal: true

module Reports
  module Efficiency
    class User
      class RecordError < StandardError; end

      ATTRIBUTES = %i[id first_name last_name duration duration_all projects].freeze

      attr_reader(*ATTRIBUTES)

      # rubocop:disable Metrics/ParameterLists
      def initialize(
        id:,
        first_name:,
        last_name:,
        work_times_duration:,
        work_times_duration_all:,
        work_times_users_projects:
      )
        @id = id
        @first_name = first_name
        @last_name = last_name
        @duration = work_times_duration
        @duration_all = work_times_duration_all

        @projects = JSON.parse(work_times_users_projects).map(&method(:build_project))

        raise RecordError, 'incorrect user' if id.blank?
      end
      # rubocop:enable Metrics/ParameterLists

      def duration_to_days
        duration.to_f / 60 / 60 / 24
      end

      def build_project(project)
        Project.new(
          **project.symbolize_keys,
          work_times_duration_all: duration.to_i
        )
      end

      def percentage_part
        duration.to_f / duration_all
      end
    end
  end
end
