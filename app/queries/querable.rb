# frozen_string_literal: true

module Querable
  def execute_sql(raw_sql)
    ActiveRecord::Base.connection.execute(raw_sql)
  end

  def sanitize_array(arr)
    ActiveRecord::Base.send(:sanitize_sql_array, arr)
  end
end
