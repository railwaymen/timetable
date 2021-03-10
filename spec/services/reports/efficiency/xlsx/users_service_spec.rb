# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reports::Efficiency::Xlsx::UsersService do
  describe 'fill_sheet' do
    context 'working days' do
      it 'correctly calc %' do
        projects = FactoryBot.create_list(:project, 4)
        users = FactoryBot.create_list(:user, 4)
        time_pivot = Time.current.beginning_of_day

        10.times do |i|
          users.each do |user|
            projects.each_with_index do |project, j|
              starts_at = time_pivot - i.days + j.hours
              ends_at = time_pivot - i.days + j.hours + 60.minutes

              FactoryBot.create(:work_time, user_id: user.id, project_id: project.id, starts_at: starts_at, ends_at: ends_at)
            end
          end
        end

        days = (time_pivot - 10.days).to_date.business_days_until(time_pivot)
        required_hours_number = days * 60 * 60 * 60 / 10

        service = described_class.new(starts_at: time_pivot - 10.days, ends_at: time_pivot)
        durations = service.collection.records.map(&:duration)

        durations.each do |duration|
          expect(duration).to eq(required_hours_number)
        end

        expect(service.buisness_days_work_hours).to eq required_hours_number

        binding.pry
      end
    end

    context 'when worksheet sheet index does not exists' do
      it 'correctly creates new sheet and assign attributes' do
        projects = FactoryBot.create_list(:project, 4)
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

        workbook = described_class.new(sheet_index: 1).call

        expect(workbook).to be_present
      end
    end

    context 'when worksheet sheet index does exists' do
      context 'when projects does not exists' do
        it 'correctly build XLSX worksheet' do
          workbook = described_class.new.call

          expect(workbook).to be_present
        end
      end

      context 'when no billable projects' do
        it 'correctly build XLSX worksheet' do
          projects = FactoryBot.create_list(:project, 4)
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

          workbook = described_class.new.call

          expect(workbook).to be_present
        end
      end

      context 'when are billable projects' do
        it 'correctly build XLSX worksheet' do
          FactoryBot.create_list(:project, 2, billable: true)
          FactoryBot.create_list(:project, 2, billable: false)
          users = FactoryBot.create_list(:user, 4)
          time_pivot = Time.current.beginning_of_day

          10.times do |i|
            users.each do |user|
              Project.all.each_with_index do |project, j|
                starts_at = time_pivot - i.days + j.hours
                ends_at = time_pivot - i.days + j.hours + rand(15..54).minutes

                FactoryBot.create(:work_time, user_id: user.id, project_id: project.id, starts_at: starts_at, ends_at: ends_at)
              end
            end
          end

          workbook = described_class.new.call

          expect(workbook).to be_present
        end
      end
    end
  end
end
