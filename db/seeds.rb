# frozen_string_literal: true

User.where(email: 'admin@example.com').first_or_create! first_name: 'Admin', last_name: 'Admin', password: 'password', lang: :en, admin: true
User.where(email: 'manager@example.com').first_or_create! first_name: 'Manager', last_name: 'Manager', password: 'password', lang: :en, manager: true
User.where(email: 'staffmanager@example.com').first_or_create! first_name: 'Staff', last_name: 'Manager', password: 'password', lang: :en, staff_manager: true
User.where(email: 'hardwaremanager@example.com').first_or_create! first_name: "Hardware", last_name: "Manager", password: "password", lang: :en, hardware_manager: true

Project.where(name: 'Lunch').first_or_create! internal: true, lunch: true
Project.where(name: 'Vacation').first_or_create! internal: true, autofill: true
Project.where(name: 'ZKS').first_or_create! internal: true, autofill: true

