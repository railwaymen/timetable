# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reports::Efficiency::ProjectsQuery do
  describe 'records' do
    it 'correctly select and calculate projects attributes' do
      project1 = FactoryBot.create(:project, tag: 'marketing', billable: true)
      project2 = FactoryBot.create(:project, tag: 'lunch', billable: false)
      project3 = FactoryBot.create(:project, tag: 'project', billable: true)
      project4 = FactoryBot.create(:project, tag: 'project', billable: true)

      projects = [project1, project2, project3, project4]
      users = FactoryBot.create_list(:user, 4)
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

      total_billable = WorkTime.joins(:project).group(:billable).sum(:duration)
      total = total_billable.sum(&:second)

      expect(query[0]).to have_attributes(
        name: project1.name,
        project_duration: WorkTime.joins(:project).where(projects: { id: project1.id }).sum(:duration),
        work_times_duration_all: total,
        work_times_duration_billable_all: total_billable[true],
        work_times_duration_unbillable_all: total_billable[false]
      )
      expect(query[1]).to have_attributes(
        name: project2.name,
        project_duration: WorkTime.joins(:project).where(projects: { id: project2.id }).sum(:duration),
        work_times_duration_all: total,
        work_times_duration_billable_all: total_billable[true],
        work_times_duration_unbillable_all: total_billable[false]
      )
      expect(query[2]).to have_attributes(
        name: project3.name,
        project_duration: WorkTime.joins(:project).where(projects: { id: project3.id }).sum(:duration),
        work_times_duration_all: total,
        work_times_duration_billable_all: total_billable[true],
        work_times_duration_unbillable_all: total_billable[false]
      )
      expect(query[3]).to have_attributes(
        name: project4.name,
        project_duration: WorkTime.joins(:project).where(projects: { id: project4.id }).sum(:duration),
        work_times_duration_all: total,
        work_times_duration_billable_all: total_billable[true],
        work_times_duration_unbillable_all: total_billable[false]
      )
    end
  end
end
