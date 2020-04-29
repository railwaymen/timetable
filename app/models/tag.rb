# frozen_string_literal: true

class Tag < ApplicationRecord
  has_many :taggings, dependent: :destroy

  validates :name, presence: true
end
