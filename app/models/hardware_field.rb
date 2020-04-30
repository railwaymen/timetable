# frozen_string_literal: true

class HardwareField < ApplicationRecord
  belongs_to :hardware

  validates :value, presence: true
  validates :name, presence: true, uniqueness: { scope: :hardware }
end
