require 'rails_helper'

RSpec.describe ExternalAuth, type: :model do
  it { should belong_to(:project) }
end
