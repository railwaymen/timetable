# frozen_string_literal: true

class HardwareMailer < ApplicationMailer
  layout 'mailer'

  def send_agreement_to_accountancy(current_user, pdf, agreement_type)
    @body = I18n.t('apps.hardware.mailer.body', user_name: current_user.to_s, action: I18n.t("apps.hardware.mailer.#{agreement_type}"))
    title = "#{I18n.t('apps.hardware.mailer.title', action: agreement_type.capitalize)} #{current_user}"
    attachments["#{I18n.t("apps.hardware.hardware_#{agreement_type}")} #{current_user}.pdf".downcase.tr(' ', '_')] = pdf
    mail(to: Rails.application.secrets[:accountancy_mail], subject: title, content_type: 'text/html')
  end
end
