# frozen_string_literal: true

class Tag < ApplicationRecord
  include Discard::Model
  include FilterConcern

  has_many :taggings, dependent: :destroy
  has_many :work_times, dependent: :nullify
  belongs_to :project

  validates :name, presence: true
  validates :name, uniqueness: true
end
