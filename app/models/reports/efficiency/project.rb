# frozen_string_literal: true

module Reports
  module Efficiency
    class Project
      include XlsxHelper

      class RecordError < StandardError; end

      ATTRIBUTES = %i[id name project_duration tag billable work_times_duration_all work_times_duration_billable_all work_times_duration_unbillable_all].freeze

      attr_reader(*ATTRIBUTES)

      alias billable? billable

      # rubocop:disable Metrics/ParameterLists
      def initialize(
        id:,
        name:,
        tag:,
        billable:,
        work_times_duration:,
        work_times_duration_all:,
        work_times_duration_billable_all: 0,
        work_times_duration_unbillable_all: 0,
        **
      )
        @id = id
        @name = name
        @project_duration = work_times_duration
        @work_times_duration_all = work_times_duration_all
        @work_times_duration_billable_all = work_times_duration_billable_all || 0
        @work_times_duration_unbillable_all = work_times_duration_unbillable_all || 0
        @tag = tag
        @billable = billable

        raise RecordError, 'incorrect project' if id.blank?
      end
      # rubocop:enable Metrics/ParameterLists

      def percentage_part
        return 0 if work_times_duration_all.zero? || !project_duration

        project_duration.to_f / work_times_duration_all
      end

      def project_duration_to_days
        duration_to_workable_days(project_duration.to_f)
      end

      def billing_percentage_part
        divider = billable? ? work_times_duration_billable_all : work_times_duration_unbillable_all

        return 0 if divider.zero? || !project_duration

        percentage_duration = project_duration.to_f

        percentage_duration / divider
      end
    end
  end
end
