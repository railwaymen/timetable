# frozen_string_literal: true

class Company < ApplicationRecord
  has_many :lenders, dependent: :destroy

  validates :name, :address, :zip_code, :city, :nip, :krs, presence: true
end
