# frozen_string_literal: true

module Reports
  module Efficiency
    module Csv
      class UsersService < EfficiencyService
        ATTRIBUTES = %w[name project tag billable billable_yes billable_no time percentage_of_time global_participation_percentage working_days].freeze

        def initialize(starts_at: Time.current - 1.month, ends_at: Time.current)
          @collection = UsersQuery.new(starts_at: starts_at, ends_at: ends_at)
          @buisness_days = calculate_days_should_work(starts_at, ends_at)
          @buisness_days_work_hours = @buisness_days * 8 * 60 * 60
        end

        def call # rubocop:disable Metrics/MethodLength
          CSV.generate do |csv|
            csv << ATTRIBUTES

            if @collection.present?
              @collection.each do |user|
                csv << user_cell(user: user)

                user.projects.each do |project|
                  csv << project_cell(project: project)
                end
              end
            end
          end
        end

        private

        def user_cell(user:) # rubocop:disable Metrics/MethodLength
          [
            "#{user.first_name} #{user.last_name}",
            '',
            '',
            '',
            user.percentage_sum_billable[true],
            user.percentage_sum_billable[false],
            user.duration_to_days,
            user.duration_to_days / @buisness_days,
            user.percentage_part,
            @buisness_days
          ]
        end

        def project_cell(project:)
          [
            '',
            project.name,
            project.tag,
            project.billable ? 'y' : 'n',
            '',
            '',
            project.project_duration_to_days,
            project.percentage_part
          ]
        end
      end
    end
  end
end
