require 'ffaker'

User.where(email: 'admin@example.com').first_or_create! first_name: FFaker::Name.first_name, last_name: FFaker::Name.last_name, password: 'password', admin: true
User.where(email: 'manager@example.com').first_or_create! first_name: FFaker::Name.first_name, last_name: FFaker::Name.last_name, password: 'password', manager: true

Project.where(name: 'Lunch').first_or_create! internal: true, lunch: true
Project.where(name: 'Vacation').first_or_create! internal: true, autofill: true
