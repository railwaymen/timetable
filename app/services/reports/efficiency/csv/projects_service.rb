# frozen_string_literal: true

require 'csv'

module Reports
  module Efficiency
    module Csv
      class ProjectsService < EfficiencyService
        ATTRIBUTES = ['project', 'tag', 'billable', 'time spent', '% of time of billable/nonbillable projects', '% of time of all projects'].freeze

        attr_reader :collection

        def initialize(starts_at: Time.current - 1.month, ends_at: Time.current)
          @collection = ProjectsQuery.new(starts_at: starts_at, ends_at: ends_at)
          @starts_at = starts_at
          @ends_at = ends_at

          @work_times_duration_all = @collection[0]&.work_times_duration_all
          @work_times_duration_billable_all = @collection[0]&.work_times_duration_billable_all
          @work_times_duration_unbillable_all = @collection[0]&.work_times_duration_unbillable_all
        end

        def call
          CSV.generate do |csv|
            csv << ATTRIBUTES

            if @collection.present?
              @collection.each do |project|
                csv << build_project(project: project)
              end

              build_projects_summary.each { |e| csv << e }
              build_billing_summary.each { |e| csv << e }
              build_tags_summary.each { |e| csv << e }
            end
          end
        end

        private

        def build_project(project:)
          [
            project.name,
            project.tag,
            project.billable ? 'y' : 'n',
            project.project_duration_to_days,
            project.billing_percentage_part,
            project.percentage_part
          ]
        end

        def build_projects_summary
          []
        end

        def build_billing_summary
          [
            ['Summary', 'Hours', '%'],
            ['y', duration_to_days(@work_times_duration_billable_all), @work_times_duration_billable_all.to_f / @work_times_duration_all],
            ['n', duration_to_days(@work_times_duration_unbillable_all), @work_times_duration_unbillable_all.to_f / @work_times_duration_all],
            ['total', duration_to_days(@work_times_duration_unbillable_all + @work_times_duration_billable_all), '']
          ]
        end

        def build_tags_summary
          list = @collection.group_by(&:tag).map do |tag_name, tag_collection|
            tag_duration = tag_collection.sum(&:project_duration)

            [tag_name, duration_to_days(tag_duration), tag_duration.to_f / @work_times_duration_all]
          end

          [
            ['Tag', 'Hours', '%'],
            *list,
            %w[total sum sum]
          ]
        end
      end
    end
  end
end
