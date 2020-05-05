# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CreateUserPosition do
  it 'creates new tags' do
    user = create(:user)

    CreateUserPosition.new(user, ['Tag 1']).call

    expect(Tag.where(name: 'Tag 1')).to exist
  end

  it 'creates new taggings' do
    user = create(:user)
    tag1 = create(:tag, name: 'Tag 1')

    CreateUserPosition.new(user, ['Tag 1']).call

    expect(Tagging.where(taggable_id: user.id, tag_id: tag1)).to exist
  end

  it 'deletes old taggings' do
    user = create(:user)
    tag1 = create(:tag, name: 'Tag 1')
    tag2 = create(:tag, name: 'Tag 2')

    create(:tagging, taggable: user, tag: tag1)

    aggregate_failures 'changes tag' do
      CreateUserPosition.new(user, ['Tag 2']).call
      expect(Tagging.where(taggable_id: user.id, tag_id: tag1)).to_not exist
      expect(Tagging.where(taggable_id: user.id, tag_id: tag2)).to exist
    end

    aggregate_failures 'removes tag' do
      CreateUserPosition.new(user, []).call
      expect(Tagging.where(taggable_id: user.id, tag_id: tag1)).to_not exist
      expect(Tagging.where(taggable_id: user.id, tag_id: tag2)).to_not exist
    end
  end
end
