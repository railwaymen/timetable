# frozen_string_literal: true

module Vacations
  class WorkTimesIn
    def initialize(start_date, end_date, user_id)
      @end_date = end_date
      @start_date = start_date
      @user_id = user_id
    end

    def perform
      WorkTime.where(work_time_sql,
                     start_date: start_date.beginning_of_day,
                     end_date: end_date.beginning_of_day + 7.hours,
                     user_id: user_id)
    end

    private

    attr_reader :user_id, :start_date, :end_date

    def work_time_sql
      <<-SQL
        (
          (
            (starts_at BETWEEN :start_date AND :end_date) AND
            (
              (extract(hour from "starts_at") BETWEEN (extract(hour from TIMESTAMP :start_date)) AND '24') OR
              (extract(hour from "starts_at") BETWEEN '0' AND (extract(hour from TIMESTAMP :end_date)))
            )
          ) OR
          (
            (ends_at BETWEEN :start_date AND :end_date) AND
            (
              (extract(hour from "ends_at") BETWEEN (extract(hour from TIMESTAMP :start_date)) AND '24') OR
              (extract(hour from "ends_at") BETWEEN '0' AND (extract(hour from TIMESTAMP :end_date)))
            )
          )
        ) AND
        discarded_at IS NULL AND
        user_id = :user_id
      SQL
    end
  end
end
