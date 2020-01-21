# frozen_string_literal: true

class VacationMailer < ApplicationMailer
  layout 'mailer'

  def send_information_to_accountancy(vacation)
    @vacation = vacation
    @user = User.find(@vacation.user_id)
    @duration = @vacation.start_date.to_date.business_days_until(@vacation.end_date.to_date + 1.day)
    @type_code = I18n.t("common.vacation_code.#{@vacation.vacation_sub_type.nil? ? @vacation.vacation_type : @vacation.vacation_sub_type}")
    title = "[Urlop] #{@user} #{@vacation.start_date.strftime('%d/%m/%Y')} - #{@vacation.end_date.strftime('%d/%m/%Y')}"
    mail(to: 'proofexakis@gmail.com', subject: title, content_type: 'text/html')
  end
end
