# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkTimeHelper, type: :helper do
  describe 'task preview' do
    context 'href with slashes' do
      it 'correctly display preveiw with numbers' do
        url = 'https://www.example.com/board1/task1'

        expect(helper.task_preview_helper(url)).to eq 'task1'
      end

      it 'correctly display preveiw with words' do
        url = 'https://www.example.com/board1/task'

        expect(helper.task_preview_helper(url)).to eq 'task'
      end
    end
  end

  context 'with get in path' do
    it 'correctly display preveiw with numbers' do
      url = 'https://www.example.com/board1?get_information=1&task_name=task1'

      expect(helper.task_preview_helper(url)).to eq 'task1'
    end

    it 'correctly display preveiw with words' do
      url = 'https://www.example.com/board1?get_information=1&task_name=task'

      expect(helper.task_preview_helper(url)).to eq 'task'
    end
  end
end
