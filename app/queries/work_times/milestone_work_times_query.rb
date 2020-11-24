# frozen_string_literal: true

module WorkTimes
  class MilestoneWorkTimesQuery
    def initialize(milestone, project, from_date, to_date)
      @milestone = milestone
      @project = project
      @from_date = from_date
      @to_date = to_date
    end

    def perform
      project.work_times
             .kept
             .where(work_time_sql,
                    from_date: from_date)
             .order(:starts_at)
    end

    private

    attr_reader :project, :milestone, :from_date, :to_date

    def sql_to_date
      return unless to_date

      ActiveRecord::Base.sanitize_sql_array(['AND date <= ?', to_date])
    end

    def other_sql_jira_issues
      return [] if milestone.nil?

      issues = project.milestones.where.not(id: milestone.id).flat_map(&:jira_issues)
      return [] if issues.empty?

      ActiveRecord::Base.sanitize_sql_array(['[?]', issues])
    end

    def sql_jira_issues
      return [] unless milestone&.jira_issues

      ActiveRecord::Base.sanitize_sql_array(['[?]', milestone.jira_issues])
    end

    def work_time_sql
      <<-SQL
        ((
          date >= :from_date
          #{sql_to_date} AND
          (integration_payload->'Jira'->>'task_id' IS NULL OR NOT(integration_payload->'Jira'->>'task_id' = ANY(ARRAY#{other_sql_jira_issues}::text[])))
          ) OR
        (
          integration_payload IS NOT NULL AND
          integration_payload->'Jira'->>'task_id' = ANY(ARRAY#{sql_jira_issues}::text[]) AND
          NOT(integration_payload->'Jira'->>'task_id' = ANY(ARRAY#{other_sql_jira_issues}::text[]))
        ))
      SQL
    end
  end
end
