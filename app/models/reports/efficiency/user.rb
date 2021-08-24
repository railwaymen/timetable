# frozen_string_literal: true

module Reports
  module Efficiency
    class User
      include XlsxHelper

      class RecordError < StandardError; end

      Billable = Struct.new(:percentage, :full_days, keyword_init: true)

      ATTRIBUTES = %i[id first_name last_name department duration duration_all projects].freeze

      attr_reader(*ATTRIBUTES)
      attr_accessor :no_vacations

      # rubocop:disable Metrics/ParameterLists
      def initialize(
        id:,
        first_name:,
        last_name:,
        work_times_duration:,
        work_times_duration_all:,
        department:,
        work_times_users_projects:
      )
        @id = id
        @first_name = first_name
        @last_name = last_name
        @duration = work_times_duration
        @department = department
        @duration_all = work_times_duration_all

        @projects = JSON.parse(work_times_users_projects).compact.map(&method(:build_project))

        raise RecordError, 'incorrect user' if id.blank?
      end
      # rubocop:enable Metrics/ParameterLists

      def sum_billable
        @sum_billable ||= begin
          billable_object_default = {
            true => Billable.new(percentage: 0, full_days: 0),
            false => Billable.new(percentage: 0, full_days: 0)
          }

          projects.group_by(&:billable).each_with_object(billable_object_default) do |e, hash|
            sum = e[1].sum(&:project_duration).to_f

            hash[e[0]] = Billable.new(percentage: sum / duration, full_days: duration_to_workable_days(sum))
          end
        end
      end

      def duration_to_days
        duration_to_workable_days(duration.to_f)
      end

      def duration_to_fully_days
        duration_to_full_days(duration.to_f)
      end

      def build_project(project)
        Project.new(
          **project.symbolize_keys,
          work_times_duration_all: duration.to_i
        )
      end

      def percentage_part
        return 0 if duration.nil?

        duration.to_f / duration_all
      end
    end
  end
end
