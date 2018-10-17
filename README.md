# Timetable

[![Build Status](https://travis-ci.com/railwaymen/timetable.svg?branch=master)](https://travis-ci.com/railwaymen/timetable)

Time tracking web application with reports & basic accounting functionality. Used internally by Railwaymen company to track developers time on client projects.

## Functionalities

* Time tracking for projects

Projects can allow for adding url to task i.e. https://jira.atlassian.net/browse/XXX-111

Regular users can add/edit work time only 3 days in the past

System tracks and display all history for work time updates

* Reports by user/projects with export to csv

Manager has access to reports from all projects

Project liders have acces to reports only from their projects

* Simple roles system admin/manager/user

Currently roles needs to assinged from console by editing user record

* Simple accounting module

System allows for creating accounting periods for employees. Supports contract & full time employees accounting.

* LDAP integration

This can be enabled in secrets.yml

* Translations

System is translated into 2 languages: English and Polish

## Requirements

* Ruby 2.4.1
* PostgreSQL 9.6.10
* Redis 4.0.9

## Getting started

To get it running locally run the following after cloning the repository:

```
bundle install
cp env.yml.example env.yml
bundle exec rake db:create
bundle exec rake db:seed
bundle exec rails s
```

Visit localhost:3000 and login using following credentails :

| email               | password | role    |
|---------------------|----------|---------|
| admin@example.com   | password | admin   |
| manager@example.com | password | manager |

After login on admin account you can create your own projects for the clients and accounts for your employees.

You can also generate some example data to play with the application by running:

Note: this will take few minutes and can raise exceptions if you've already added some work times.

```
bundle exec rake populate_dev_data
```

This will generate following user accounts with some example work times

| email              | password | role |
|------------------- |----------|------|
| user1@example.com  | password | user |
| user2@example.com  | password | user |
| user3@example.com  | password | user |
| user4@example.com  | password | user |
| user5@example.com  | password | user |
| user6@example.com  | password | user |
| user7@example.com  | password | user |
| user8@example.com  | password | user |
| user9@example.com  | password | user |
| user10@example.com | password | user |
