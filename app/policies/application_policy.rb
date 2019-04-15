# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record

  # :nocov:
  def initialize(user, record)
    @user = user
    @record = record
  end
  # :nocov:

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    # :nocov:
    def resolve
      scope.all
    end
    # :nocov:
  end
end
