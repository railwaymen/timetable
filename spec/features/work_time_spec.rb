require 'rails_helper'

describe 'signs me in, view projects, accounting_periods, timesheet', type: :feature, js: true do
  around do |example|
    I18n.with_locale(:en) do
      example.run
    end
  end

  def login_user(user)
    visit '/users/sign_in'
    within('#new_user') do
      fill_in 'user[email]', with: user.email
      fill_in 'user[password]', with: 'password'
      click_button 'sign_in'
    end
  end

  def create_task(message, from, to)
    within('#content') do
      fill_in 'What have you done ?', with: message
      fill_in 'start', with: from
      fill_in 'end', with: to
      fill_in 'task', with: 'www.example.com'
    end

    find(:css, '.fluid div.text').click
    find(:css, '.menu.visible > .item:last-child').click
    page.find('.btn-start', text: 'Save').click

    expect(page).to have_content message
  end

  def edit_task_body(message)
    find('.description-container', text: message).click
    first(:css, '.description-container textarea').send_keys('Another message')
    find('body').click
  end

  def edit_task_hours(from, to)
    find('.time-container', text: "#{from} - #{to}").click
    find(:css, 'input.start-input').set('15:00')
    page.execute_script('$("input.end-input").val("15:30");')
    find('body').click
  end

  def edit_task_project
    find('.project-pill').click
    find('.menu.transition.visible > .item:first-child').click
    find('body').click
  end

  def delete_task
    find('.time-entries-list-container .entry:first-child').hover
    accept_alert do
      page.execute_script('$(".action-container .destroy i").first().click()')
    end
  end

  def select_2_months_ago_tasks(work_time)
    find('.select-month').first('.button').click
    find('a.item', text: "#{work_time.starts_at.strftime('%b')} #{Time.zone.now.strftime('%y')}").click
  end

  it 'Timesheet' do
    expect(Sidekiq).to receive(:redis).at_least(:once).and_return([])
    project = Project.create(name: 'test', active: true)
    Project.create(name: 'another', active: true)
    user = FactoryGirl.create :user, lang: 'en', password: 'password'

    work_time = create(:work_time, user: user, project: project, starts_at: 2.months.ago.beginning_of_day, ends_at: 2.months.ago.end_of_day)
    message = 'Test message'
    from = '13:40'
    to = '14:00'

    login_user(user)

    click_link('Timesheet')
    expect(page).to have_content 'Total worktime in selected period :'

    create_task(message, from, to)

    edit_task_body(message)
    edit_task_hours(from, to)
    edit_task_project

    delete_task

    select_2_months_ago_tasks(work_time)

    click_link('Accounting Periods')
    expect(page).to have_selector('table')

    click_link('Projects')
    expect(page).to have_content('Rank')

    click_link("#{user.last_name} #{user.first_name}")
    expect(page).to have_selector('input')

    click_link('Sign out')
    expect(page).to have_content('Zaloguj')
  end
end
