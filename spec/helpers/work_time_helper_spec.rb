# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkTimeHelper, type: :helper do
  describe 'task preview' do
    context 'href with slashes' do
      it 'properly resolve case 1' do
        url = 'https://jira.atlassian.net/browse/XXX-1500'

        expect(helper.task_preview_helper(url)).to eq 'XXX-1500'
      end

      it 'properly resolve case 2' do
        url = 'https://www.pivotaltracker.com/story/show/99755474'

        expect(helper.task_preview_helper(url)).to eq '99755474'
      end

      it 'properly resolve case 3' do
        url = 'https://www.meistertask.com/app/task/b1halWDv/'

        expect(helper.task_preview_helper(url)).to eq 'b1halWDv'
      end

      it 'properly resolve case 4' do
        url = 'https://trello.com/c/8jr8HV0k/111-example-message-from-service-task'

        expect(helper.task_preview_helper(url)).to eq '111-example-message-from-service-task'
      end

      it 'properly resolve case 5' do
        url = 'https://bm.example.com/projects/66/dashboard/12345'

        expect(helper.task_preview_helper(url)).to eq '12345'
      end

      it 'properly resolve case 6' do
        url = 'https://www.meistertask.com/app/task/8l58peA0/'

        expect(helper.task_preview_helper(url)).to eq '8l58peA0'
      end

      it 'properly resolve case 7' do
        url = 'https://jira.atlassian.net/browse/XXX-1500?foo=1&bar=2'

        expect(helper.task_preview_helper(url)).to eq 'XXX-1500'
      end
    end
  end
end
