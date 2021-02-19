# frozen_string_literal: true

require_relative '../querable'

module Milestones
  class CurrentQuery
    include Querable

    def initialize(project_ids:)
      @project_ids = project_ids
    end

    def results
      Milestone.find_by_sql(sanitized_sql)
    end

    private

    def sanitized_sql
      sanitize_array [raw, { q: @project_ids.split(',') }]
    end

    def raw
      <<~SQL.squish
        SELECT DISTINCT ON(milestones.project_id) milestones.*,
          sum(work_times.duration) as work_times_duration
        FROM milestones
        LEFT OUTER JOIN work_times ON
          (
            (
              (work_times.integration_payload IS NULL AND
               work_times.date >= milestones.starts_on AND
               work_times.date <= milestones.ends_on) OR
              (work_times.integration_payload IS NOT NULL AND
               work_times.integration_payload->'Jira'->>'task_id' = ANY(milestones.jira_issues))
            ) AND
            work_times.project_id = milestones.project_id 
          )
        WHERE milestones.project_id IN (:q) AND
         milestones.closed = false
        GROUP BY milestones.id
        ORDER BY milestones.project_id, milestones.starts_on
      SQL
    end
  end
end
