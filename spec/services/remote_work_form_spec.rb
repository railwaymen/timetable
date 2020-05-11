# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RemoteWorkForm do
  describe '#validations' do
    it 'validates_date' do
      remote_work = build(:remote_work, starts_at: Time.zone.now, ends_at: 2.days.ago)
      form = RemoteWorkForm.new(remote_work)

      expect(form.save).to eql(false)
      expect(form.errors.details).to eql({ starts_at: [{ error: :incorrect_range }, { error: :incorrect_hours }] })
    end

    it 'validates_hours' do
      starts_at = Time.zone.now.beginning_of_day + 8.hours
      remote_work = build(:remote_work, starts_at: starts_at, ends_at: starts_at - 1.hour)
      form = RemoteWorkForm.new(remote_work)

      expect(form.save).to eql(false)
      expect(form.errors.details).to eql({ starts_at: [{ error: :incorrect_hours }] })
    end
  end
end
