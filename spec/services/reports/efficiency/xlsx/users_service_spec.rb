# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reports::Efficiency::Xlsx::UsersService do
  describe 'fill_sheet' do
    context 'when worksheet sheet index does not exists' do
      it 'correctly creates new sheet and assign attributes' do
        projects = FactoryBot.create_list(:project, 4)
        users = FactoryBot.create_list(:user, 4)
        time_pivot = Time.current.beginning_of_day

        stub_const('Reports::Efficiency::UsersVacationsQuery::VACATION_PROJECT_ID', projects.first.id)

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

    context 'when user have been created before generate report scope' do
      it 'correctly creates new sheet and assign attributes' do
        projects = FactoryBot.create_list(:project, 4)
        users = FactoryBot.create_list(:user, 4, created_at: Time.current - 3.months)

        user = FactoryBot.create(:user, created_at: Time.current - 2.days)
        time_pivot = Time.current.beginning_of_day

        stub_const('Reports::Efficiency::UsersVacationsQuery::VACATION_PROJECT_ID', projects.first.id)

        10.times do |i|
          users.each do |user|
            projects.each_with_index do |project, j|
              starts_at = time_pivot - i.days + j.hours
              ends_at = time_pivot - i.days + j.hours + rand(15..54).minutes

              FactoryBot.create(:work_time, user_id: user.id, project_id: project.id, starts_at: starts_at, ends_at: ends_at)
            end
          end
        end

        workbook = described_class.new(sheet_index: 1, starts_at: Time.current - 1.month, ends_at: Time.current).call

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
