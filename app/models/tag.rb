# frozen_string_literal: true

class Tag < ApplicationRecord
  include Discard::Model

  has_many :taggings, dependent: :destroy

  validates :name, presence: true
end
