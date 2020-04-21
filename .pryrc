# frozen_string_literal: true

Pry.config.prompt_name = 'timetable'

begin
  require 'awesome_print'
  AwesomePrint.defaults = {
    sort_keys: true
  }
  Pry.config.print = proc { |output, value| output.puts value.ai(indent: 2) }
rescue StandardError
  puts 'no awesome_print :('
end
