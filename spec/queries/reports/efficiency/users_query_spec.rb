# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reports::Efficiency::UsersQuery do
  describe 'records' do
    it 'correctly select and calculate projects attributes' do
      FactoryBot.create(:project, tag: 'marketing', billable: true)
      FactoryBot.create(:project, tag: 'lunch', billable: false)
      FactoryBot.create(:project, tag: 'project', billable: true)
      FactoryBot.create(:project, tag: 'project', billable: true)
      FactoryBot.create(:project, tag: 'project', billable: false)

      user1 = FactoryBot.create(:user)
      user2 = FactoryBot.create(:user)
      user3 = FactoryBot.create(:user)
      user4 = FactoryBot.create(:user)

      projects = Project.all
      users = [user1, user2, user3, user4]
      time_pivot = Time.current.beginning_of_day

      10.times do |i|
        users.each do |user|
          projects.each_with_index do |project, j|
            starts_at = time_pivot - i.days + j.hours
            ends_at = time_pivot - i.days + j.hours + rand(15..54).minutes

            FactoryBot.create(:work_time, user_id: user.id, project_id: project.id, starts_at: starts_at, ends_at: ends_at)
          end
        end
      end

      query = described_class.new(starts_at: Time.current - 1.month, ends_at: Time.current)

      user1_duration = WorkTime.where(user_id: user1.id).sum(:duration)
      expect(query[0]).to have_attributes(
        first_name: user1.first_name,
        last_name: user1.last_name,
        duration: user1_duration
      )
      expect(query[0].projects.sum(&:project_duration)).to eq(user1_duration)

      user2_duration = WorkTime.where(user_id: user2.id).sum(:duration)
      expect(query[1]).to have_attributes(
        first_name: user2.first_name,
        last_name: user2.last_name,
        duration: user2_duration
      )
      expect(query[1].projects.sum(&:project_duration)).to eq(user2_duration)

      user3_duration = WorkTime.where(user_id: user3.id).sum(:duration)
      expect(query[2]).to have_attributes(
        first_name: user3.first_name,
        last_name: user3.last_name,
        duration: user3_duration
      )
      expect(query[2].projects.sum(&:project_duration)).to eq(user3_duration)

      user4_duration = WorkTime.where(user_id: user4.id).sum(:duration)
      expect(query[3]).to have_attributes(
        first_name: user4.first_name,
        last_name: user4.last_name,
        duration: user4_duration
      )
      expect(query[3].projects.sum(&:project_duration)).to eq(user4_duration)
    end
  end
end
