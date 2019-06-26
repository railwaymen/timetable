# frozen_string_literal: true

require 'rails_helper'

describe 'signs me in, view projects, accounting_periods, timesheet', type: :feature, js: true do
  around do |example|
    I18n.with_locale(:en) do
      example.run
    end
  end

  def login_user(user, with: 'password')
    visit '/users/sign_in'
    within('#new_user') do
      fill_in 'user[email]', with: user.email
      fill_in 'user[password]', with: with
      click_button 'sign_in'
    end
  end

  # rubocop:disable Metrics/MethodLength

  def create_task(message, from, to)
    within('#content') do
      fill_in 'What have you done ?', with: message
      find('.project-dropdown').click
      find('.project-dropdown .item:nth-child(1)').click
      find('#start').click
      fill_in 'start', with: from
      find('#end').click
      fill_in 'end', with: to
      fill_in 'task', with: 'www.example.com/task1'
      find('input.tags:last-child').click
    end

    find(:css, '.fluid div.text').click
    find(:css, '.menu.visible > .item:last-child').click
    page.find('#content button.bt-submit', text: 'Save').click

    expect(page).to have_content message
  end

  # rubocop:enable Metrics/MethodLength

  def edit_task_body(message)
    page.execute_script("$('.entry').removeClass('new')")
    find('.description-container', text: message).click
    first(:css, '.description-container textarea').send_keys('Another message')
    find('body').click
  end

  def edit_task_hours(from, to)
    page.execute_script("$('body').trigger('click')")
    find('.time-container .time', text: "#{from} - #{to}").click
    find(:css, 'input.start-input').set('15:00')
    find(:css, 'input.end-input').click
    find(:css, 'input.end-input').set('17:00')
    page.execute_script("$('body').trigger('click')")
  end

  def invalid_edit_task_hours(from, to)
    page.execute_script("$('body').trigger('click')")
    find('.time-container .time', text: "#{from} - #{to}").click
    find(:css, 'input.start-input').set('15:00')
    find(:css, 'input.end-input').click
    find(:css, 'input.end-input').set('15:00')
    page.execute_script("$('body').trigger('click')")
  end

  def edit_task_project
    find('.project-pill').click
    find('.menu.transition.visible > .item:first-child').click
    find('body').click
  end

  def delete_task
    find('.time-entries-list-container .entry:first-child').hover
    accept_alert do
      page.execute_script('$(".actions-container .destroy i").first().click()')
    end
  end

  def select_2_months_ago_tasks(work_time)
    find('#months').click
    find('a.item', text: "#{work_time.starts_at.strftime('%b')} #{work_time.starts_at.strftime('%y')}").click
  end

  it 'Timesheet' do
    project = Project.create(name: 'test', active: true, work_times_allows_task: true)
    Project.create(name: 'another', active: true, work_times_allows_task: true)
    user = FactoryGirl.create :user, lang: 'en', password: 'password'

    work_time = create(:work_time, user: user, project: project, starts_at: 2.months.ago.beginning_of_day, ends_at: 2.months.ago.end_of_day)
    message = 'Test message'
    from = '13:40'
    to = '14:00'

    login_user(user)
    click_link('Timesheet')

    expect(page).to have_content 'Total worktime in selected period'

    create_task(message, from, to)

    edit_task_body(message)
    invalid_edit_task_hours(from, to)
    expect(page).to have_selector('.error-tooltip')

    edit_task_hours(from, to)
    expect(page).not_to have_selector('.error-tooltip')

    edit_task_project

    delete_task

    select_2_months_ago_tasks(work_time)

    find('a.sign_out.ui.button').click
    expect(page).to have_content('Login')
  end

  it 'Accounting Periods' do
    expect(Sidekiq).to receive(:redis).at_least(:once).and_return([])
    user = FactoryGirl.create :user, lang: 'en', password: 'password'
    login_user(user)
    FactoryGirl.create_list :accounting_period, 5, user: user

    click_link('Accounting Periods')

    aggregate_failures 'contain table' do
      expect(page).to have_selector('tbody > tr', count: 5)
      expect(page).to have_selector('table')
    end
  end

  it 'Projects' do
    user = FactoryGirl.create :user, lang: 'en', password: 'password'
    project = FactoryGirl.create :project, active: true, internal: false, name: 'Project30'
    project2 = FactoryGirl.create :project, active: true, internal: false, name: 'Project60'
    project3 = FactoryGirl.create :project, active: true, internal: false, name: 'Project90'
    FactoryGirl.create :project, active: false, internal: false, name: 'Inactive'

    FactoryGirl.create :work_time, project: project, user: user, creator: user, starts_at: Time.current - 1.day - 30.minutes, ends_at: Time.current - 1.day
    FactoryGirl.create :work_time, project: project2, user: user, creator: user, starts_at: Time.current - 31.days - 30.minutes, ends_at: Time.current - 31.days
    FactoryGirl.create :work_time, project: project3, user: user, creator: user, starts_at: Time.current - 61.days - 30.minutes, ends_at: Time.current - 61.days
    login_user(user)

    click_link('Projects')
    expect(page).to have_content('Rank')
    expect(page).to have_selector('select')
    expect(page).to have_selector('select > option', count: 3)
    expect(page).to have_selector('.projects-cards > .project-card', count: 1)

    aggregate_failures 'properly filter' do
      find('select > option', text: 'Last 60 days').click
      expect(page).to have_selector('.projects-cards > .project-card', count: 2)
    end

    aggregate_failures 'properly filter' do
      find('select > option', text: 'Last 90 days').click
      expect(page).to have_selector('.projects-cards > .project-card', count: 3)
    end

    aggregate_failures 'properly filter' do
      find('select > option', text: 'Last 30 days').click
      expect(page).to have_selector('.projects-cards > .project-card', count: 1)
    end

    aggregate_failures 'projects listing - active' do
      find('a.btn.btn-default', text: 'All').click
      expect(page).to have_selector('tbody > tr', count: 3)
    end

    aggregate_failures 'projects listing - inactive' do
      find('select > option', text: 'Inactive').click
      expect(page).to have_selector('tbody > tr', count: 1)
    end

    aggregate_failures 'projects listing - all' do
      find('select > option', text: 'All').click
      expect(page).to have_selector('tbody > tr', count: 4)
    end
  end

  it 'Profile' do
    user = FactoryGirl.create :user, lang: 'en', password: 'password'
    login_user(user)

    click_link("#{user.first_name} #{user.last_name}")
    expect(page).to have_selector('input[name="first_name"]')
    expect(page).to have_selector('input[name="last_name"]')
    expect(page).to have_selector('select[name="lang"]')

    aggregate_failures 'Can edit properies' do
      within('form') do
        fill_in 'first_name', with: 'John'
        fill_in 'last_name', with: 'Doe'
        click_button 'Save'
      end

      expect(page).to have_content('Rank')
      user.reload
      expect(user.first_name).to eq 'John'
      expect(user.last_name).to eq 'Doe'
    end
  end
end
