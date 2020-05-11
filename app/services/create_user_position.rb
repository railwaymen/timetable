# frozen_string_literal: true

class CreateUserPosition
  def initialize(user, positions)
    @user = user
    @positions = positions.uniq.reject(&:empty?)
  end

  def call
    create_new_tags
    create_new_taggings
    delete_old_taggings
  end

  def create_new_tags
    @positions.each do |tag|
      Tag.find_or_create_by!(name: tag)
    end
  end

  def create_new_taggings
    new_tags = @positions - @user.tags.pluck(:name)
    new_tags.map do |tag|
      new_tag = Tag.find_by!(name: tag)
      new_tag.taggings.create!(taggable: @user)
    end
  end

  def delete_old_taggings
    if @positions.empty?
      @user.taggings.delete_all
    else
      @user.taggings.joins(:tag).where.not('tags.name in (?)', @positions).delete_all
    end
  end
end
