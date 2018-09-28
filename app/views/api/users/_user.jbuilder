json.call user, :id, :first_name, :last_name, :email, :lang, :active
json.phone user.phone if current_user.try(:admin?)
json.contract_name user.contract_name if current_user.try(:admin?)
