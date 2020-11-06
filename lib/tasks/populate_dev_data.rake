# frozen_string_literal: true

desc 'Populates dev database with randomly generated data'
task populate_dev_data: :environment do
  raise('Only works in development environment') unless Rails.env.development?

  require 'ffaker'

  PaperTrail.request.whodunnit = User.where(email: 'admin@example.com').first!.id

  10.times do |i|
    index = i + 1
    User.where(email: "user#{index}@example.com").first_or_create! first_name: FFaker::Name.first_name, last_name: FFaker::Name.last_name, password: 'password'
  end

  10.times do |i|
    index = i + 1
    Project.where(id: index).first_or_create! name: FFaker::Product.product_name
  end

  project_ids = Project.filter_by(:active).pluck(:id)

  User.find_each do |user|
    90.times do |day|
      6.times do |i|
        body = FFaker::DizzleIpsum.sentence
        starts_at = day.days.ago.beginning_of_day + 8.hours + i.hours
        ends_at = day.days.ago.beginning_of_day + 8.hours + i.hours + 1.hour
        user.work_times.create! tag: WorkTime.tags.keys.sample, body: body, starts_at: starts_at, ends_at: ends_at, project_id: project_ids.sample, creator: user, department: user.department
      end
    end
  end

  ActiveRecord::Base.connection.reset_pk_sequence!(User.table_name)
  ActiveRecord::Base.connection.reset_pk_sequence!(Project.table_name)
end
