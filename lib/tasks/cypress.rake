namespace :cypress do
  task open: :environment do
    system('npx cypress open -d')
    system('bundle exec rake db:test:prepare db:seed')
    system('bundle exec rails s -e test')
  end
end
