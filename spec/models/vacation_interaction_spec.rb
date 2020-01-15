# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationInteraction, type: :model do
  it { should belong_to(:user) }
  it { should belong_to(:vacation) }

  it { should validate_presence_of(:vacation_id) }
  it { should validate_presence_of(:user_id) }
  it { should validate_presence_of(:action) }

  it 'validates uniqueness of vacation_id scoped to user_id and action' do
    vacation_interaction1 = create(:vacation_interaction)
    vacation_interaction2 = build(:vacation_interaction, user: vacation_interaction1.user, vacation: vacation_interaction1.vacation)
    expect(vacation_interaction2.valid?).to be_falsey
    expect(vacation_interaction2.errors.messages[:base]).to eql([I18n.t('activerecord.errors.models.vacation_interaction.base.already_interacted', action: I18n.t("apps.staff.#{vacation_interaction2.action}").downcase)])
  end
end
