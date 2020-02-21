# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BirthdayEmailTemplate, type: :model do
  it { should validate_presence_of :name }
  it { should validate_presence_of :title }
  it { should validate_presence_of :body }

  it '#next returns next template' do
    template1 = create :birthday_email_template
    create :birthday_email_template, name: 'Template 2'
    expect(template1.next.name).to eql('Template 2')
  end
end
