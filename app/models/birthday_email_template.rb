# frozen_string_literal: true

class BirthdayEmailTemplate < ApplicationRecord
  validates :body, :name, :title, presence: true

  def next
    BirthdayEmailTemplate.where('id > ?', id)[0]
  end

  def set_last_used
    return if last_used

    last_used_templates = BirthdayEmailTemplate.where(last_used: true)
    last_used_templates.find_each { |template| template.update(last_used: false) }
    update(last_used: true)
  end
end
