# frozen_string_literal: true

class SearchQuery
  attr_reader :scope, :ilike_conditions

  def initialize(scope, extend_columns_with: [])
    @scope = scope
    @column_names = @scope.column_names.concat(extend_columns_with)

    @ilike_conditions = []
  end

  def execute # rubocop:disable Metrics/MethodLength
    where_clause = @ilike_conditions.join(' OR ')

    select_clause = @ilike_conditions.map do |condition|
      "CASE WHEN #{condition} THEN 1 ELSE 0 END"
    end.join(' + ')

    @scope
      .select(
        "
          #{@scope.table_name}.*,
          (#{select_clause}) AS search_strength
        "
      )
      .where(where_clause)
  end

  def ilike(names:, values:)
    names.each do |name|
      validate_column_name(name)

      values.each do |value|
        santized_condition = ActiveRecord::Base.sanitize_sql_array(["#{name} ILIKE ?", "%#{value}%"])

        @ilike_conditions.push(santized_condition)
      end
    end

    self
  end

  def custom(sql_function:, sql_function_args: [], value:)
    sql_function_attributes = sql_function_args.map(&method(:custom_query_argument)).join(', ')

    expression = "#{sql_function}(#{sql_function_attributes})"
    santized_condition = ActiveRecord::Base.sanitize_sql_array(["#{expression} ILIKE ?", "%#{value}%"])

    @ilike_conditions.push(santized_condition)

    self
  end

  private

  def custom_query_argument(argument)
    if argument[:type] == 'table'
      validate_column_name(argument[:value])
      argument[:value]
    else
      "'#{argument[:value]}'"
    end
  end

  def validate_column_name(name)
    return if @column_names.include?(name.to_s.split('.').last)

    raise StandardError, "Incorrect column name, #{name}"
  end
end
