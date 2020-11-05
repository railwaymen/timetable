# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Tag, type: :model do
  describe 'name validation' do
    it 'is not valid when name is already taken in the same project' do
      tag = create(:tag, :with_project)
      expect(Tag.new(name: tag.name, project_id: tag.project_id).valid?).to be(false)
    end

    it 'global tab is not valid when  name is already taken in project' do
      tag = create(:tag, :with_project)
      expect(Tag.new(name: tag.name).valid?).to be(false)
    end
  end
end
