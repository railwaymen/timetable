# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkTimeForm do
  describe '#save' do
    it 'validates if task is a valid uri' do
      form = described_class.new(work_time: create(:work_time, task: 'asdasd ad'))
      expect(form.save).to eql(false)
      expect(form.errors[:task]).to eql(['Task URL is not valid'])
    end
  end
end
