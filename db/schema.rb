# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190425095633) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accounting_periods", id: :serial, force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "contract_id"
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.integer "counted_duration", default: 0, null: false
    t.boolean "closed", default: false, null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "full_time", default: false, null: false
    t.integer "duration", null: false
    t.integer "position", null: false
    t.boolean "protected", default: false, null: false
    t.index ["user_id", "position"], name: "index_accounting_periods_on_user_id_and_position", unique: true
  end

  create_table "accounting_periods_recounts", id: :serial, force: :cascade do |t|
    t.integer "user_id"
    t.boolean "counting"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_accounting_periods_recounts_on_user_id"
  end

  create_table "external_auths", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.jsonb "data", null: false
    t.string "provider", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_external_auths_on_project_id"
  end

  create_table "project_report_roles", force: :cascade do |t|
    t.bigint "project_report_id", null: false
    t.bigint "user_id", null: false
    t.string "role", default: "developer", null: false
    t.decimal "hourly_wage", precision: 8, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_report_id", "user_id"], name: "index_project_report_roles_on_project_report_id_and_user_id", unique: true
    t.index ["project_report_id"], name: "index_project_report_roles_on_project_report_id"
    t.index ["user_id"], name: "index_project_report_roles_on_user_id"
  end

  create_table "project_reports", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.jsonb "initial_body", default: {}, null: false
    t.jsonb "last_body", default: {}, null: false
    t.string "state", default: "editing", null: false
    t.integer "duration_sum", null: false
    t.decimal "cost", precision: 12, scale: 2, default: "0.0", null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.string "currency", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_project_reports_on_project_id"
  end

  create_table "projects", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "internal", default: false, null: false
    t.string "color", default: "000000", null: false
    t.boolean "active", default: true, null: false
    t.boolean "work_times_allows_task", default: false, null: false
    t.bigint "leader_id"
    t.boolean "autofill", default: false, null: false
    t.boolean "lunch", default: false, null: false
    t.boolean "count_duration", default: true, null: false
    t.index ["leader_id"], name: "index_projects_on_leader_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "admin", default: false, null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "phone"
    t.string "contract_name"
    t.boolean "active", default: true, null: false
    t.boolean "manager", default: false, null: false
    t.string "lang", default: "pl", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "versions", id: :serial, force: :cascade do |t|
    t.string "item_type", null: false
    t.integer "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object"
    t.datetime "created_at"
    t.text "object_changes"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  create_table "work_times", id: :serial, force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "project_id", null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.integer "duration", default: 0, null: false
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "contract_name"
    t.boolean "active", default: true, null: false
    t.integer "creator_id", null: false
    t.boolean "updated_by_admin", default: false, null: false
    t.string "task"
    t.jsonb "integration_payload"
    t.string "tag", default: "dev", null: false
  end

  add_foreign_key "accounting_periods", "users", name: "accounting_periods_user_id_fk"
  add_foreign_key "accounting_periods_recounts", "users"
  add_foreign_key "external_auths", "projects"
  add_foreign_key "project_report_roles", "project_reports"
  add_foreign_key "project_report_roles", "users"
  add_foreign_key "project_reports", "projects"
  add_foreign_key "projects", "users", column: "leader_id"
  add_foreign_key "work_times", "projects", name: "work_times_project_id_fk"
  add_foreign_key "work_times", "users", column: "creator_id", name: "work_times_creator_id_fk"
  add_foreign_key "work_times", "users", name: "work_times_user_id_fk"
end
