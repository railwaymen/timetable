# frozen_string_literal: true

class VacationMailerPreview < ActionMailer::Preview
  def send_information_to_accountancy
    vacation = Vacation.first
    VacationMailer.send_information_to_accountancy(vacation)
  end
end
