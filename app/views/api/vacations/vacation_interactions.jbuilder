# frozen_string_literal: true

json.array! @vacation_interactions do |vacation_interaction|
  json.id vacation_interaction.id
  json.user_id vacation_interaction.user_id
  json.user_full_name vacation_interaction.user.to_s
end
