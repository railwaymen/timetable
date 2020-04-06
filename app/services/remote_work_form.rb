# frozen_string_literal: true

class RemoteWorkForm
  include ActiveModel::Validations

  attr_reader :remote_work
  attr_reader :saved

  delegate :starts_at, :ends_at, to: :remote_work

  validate :validates_date
  validate :validates_hours
  validates :starts_at, :ends_at, presence: true

  def initialize(params)
    @remote_work = RemoteWork.new(params)
    @saved = []
  end

  def save(additional_params = {})
    return false unless valid?

    if starts_at.to_date == ends_at.to_date
      save_remote_work(additional_params)
    else
      divide_remote_work(additional_params)
    end
  end

  def save_remote_work(additional_params)
    if @remote_work.save(additional_params)
      @saved = [@remote_work]
    else
      copy_errors(@remote_work)
    end
  end

  def divide_remote_work(additional_params)
    WorkTime.transaction do
      days = (starts_at.to_date..ends_at.to_date).map do |date|
        next unless date.workday?

        create_entry(date, additional_params)
      end

      @saved = days.compact
    end
  end

  private

  def create_entry(date, additional_params)
    entry = @remote_work.dup
    entry.starts_at = Time.zone.parse(date.to_s).change({ hour: starts_at.hour, min: starts_at.min, sec: 0 })
    entry.ends_at = Time.zone.parse(date.to_s).change({ hour: ends_at.hour, min: ends_at.min, sec: 0 })

    unless entry.save(additional_params)
      copy_errors(entry)
      raise ActiveRecord::Rollback
    end

    entry
  end

  def validates_date
    errors.add(:starts_at, :incorrect_range) if starts_at && ends_at && starts_at.to_date > ends_at.to_date
  end

  def validates_hours
    errors.add(:starts_at, :incorrect_hours) if starts_at && ends_at && hour_to_i(starts_at) > hour_to_i(ends_at)
  end

  def hour_to_i(date)
    date.hour * 60 + date.min
  end

  def copy_errors(remote_work)
    remote_work.errors.details.each do |key, value|
      errors.add(key, value.first[:error], value.first.except(:error))
    end
  end
end
