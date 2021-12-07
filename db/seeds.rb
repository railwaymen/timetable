# frozen_string_literal: true

User.where(email: 'admin@example.com').first_or_create! first_name: 'Admin', last_name: 'Admin', password: 'password', lang: :en, department: :other, admin: true
User.where(email: 'manager@example.com').first_or_create! first_name: 'Manager', last_name: 'Manager', password: 'password', lang: :en, department: :other, manager: true
User.where(email: 'staffmanager@example.com').first_or_create! first_name: 'Staff', last_name: 'Manager', password: 'password', lang: :en, department: :other, staff_manager: true
User.where(email: 'hardwaremanager@example.com').first_or_create! first_name: "Hardware", last_name: "Manager", password: "password", lang: :en, department: :other, hardware_manager: true

Project.where(name: 'Lunch').first_or_create! internal: true, lunch: true
Project.where(name: 'Vacation').first_or_create! internal: true, vacation: true, autofill: true
Project.where(name: 'ZKS').first_or_create! internal: true, booked: true, autofill: true

Tag.where(name: 'dev').first_or_initialize.update!(use_as_default: true)

producents = ['Apple', 'Dell', 'Lenovo', 'Microsoft']
category = ['computers', 'displays', 'mobile_phones']
models = ['A', 'B', 'C']
states = ['poor', 'good', 'average']
users = User.all
cpu = ['intel', 'amd']

accessories_names = ['Headphones', 'Hub', 'Case']
types = ['A', 'B', 'C']

150.times do |i|
  device = HardwareDevice.create!(
    category: category.sample,
    brand: producents.sample,
    device_type: types.sample,
    model: models.sample,
    serial_number: "SMSRLNMBR-#{i}-#{rand(100)}",
    year_of_production: Time.current - rand(5).years,
    year_bought: Time.current - rand(5).years,
    used_since: Time.current - rand(5).years,
    state: states.sample,
    os_version: rand(150),
    note: '',
    user_id: users.sample.id,
    cpu: cpu.sample,
    ram: rand(16),
    storage: rand(500)
  )

  rand(3).times do |j|
    device.accessories.create!(
      name: accessories_names.sample,
      quantity: 1
    )
  end
end

company = Company.where(name: "Example", address: "Street", zip_code: "30-000", city: "Cracow", nip: "12345678", krs: "0000111111").first_or_create!
lender = Lender.where(first_name: 'Jan', last_name: 'Kowalski').first_or_create!
anotherLender = Lender.where(first_name: 'Piotr', last_name: 'Nowak').first_or_create!
company.lenders << lender
company.lenders << anotherLender