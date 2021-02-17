# frozen_string_literal: true

class Lender < ApplicationRecord
  belongs_to :company

  validates :first_name, :last_name, presence: true

  def to_s
    [last_name, first_name].join(' ')
  end
end
