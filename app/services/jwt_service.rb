require 'jwt'

class JwtService
  SECRET    = ENV['JWT_SECRET']
  ALGORITHM = 'HS256'.freeze

  def self.encode(payload:)
    JWT.encode(payload, SECRET, ALGORITHM)
  end

  def self.decode(token:)
    JWT.decode(token, SECRET, true, algorithm: ALGORITHM).first
  end
end
