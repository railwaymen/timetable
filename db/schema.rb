# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_05_05_095052) do

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

  create_table "birthday_email_templates", force: :cascade do |t|
    t.text "body", default: "", null: false
    t.string "name", null: false
    t.string "title", null: false
    t.boolean "last_used", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "bottom", default: "", null: false
    t.text "header", default: "", null: false
  end

  create_table "combined_reports", force: :cascade do |t|
    t.string "name", default: "", null: false
    t.bigint "project_id"
    t.integer "duration_sum", null: false
    t.decimal "cost", precision: 12, scale: 2, null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.string "currency", null: false
    t.string "file_path"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_combined_reports_on_discarded_at"
    t.index ["project_id"], name: "index_combined_reports_on_project_id"
  end

  create_table "combined_reports_project_reports", force: :cascade do |t|
    t.bigint "combined_report_id", null: false
    t.bigint "project_report_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "discarded_at"
    t.index ["combined_report_id"], name: "index_combined_reports_project_reports_on_combined_report_id"
    t.index ["discarded_at"], name: "index_combined_reports_project_reports_on_discarded_at"
    t.index ["project_report_id"], name: "index_combined_reports_project_reports_on_project_report_id"
  end

  create_table "external_auths", force: :cascade do |t|
    t.bigint "project_id"
    t.jsonb "data", null: false
    t.string "provider", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["project_id"], name: "index_external_auths_on_project_id"
    t.index ["user_id"], name: "index_external_auths_on_user_id"
  end

  create_table "hardware_fields", force: :cascade do |t|
    t.string "name", null: false
    t.string "value", null: false
    t.bigint "hardware_id"
    t.index ["hardware_id"], name: "index_hardware_fields_on_hardware_id"
    t.index ["name", "hardware_id"], name: "index_hardware_fields_on_name_and_hardware_id", unique: true
  end

  create_table "hardwares", force: :cascade do |t|
    t.string "type", default: "laptop", null: false
    t.string "manufacturer", null: false
    t.string "model", null: false
    t.string "serial_number", null: false
    t.bigint "user_id"
    t.boolean "locked", default: false, null: false
    t.index ["serial_number"], name: "index_hardwares_on_serial_number", unique: true
    t.index ["user_id"], name: "index_hardwares_on_user_id"
  end

  create_table "project_report_roles", force: :cascade do |t|
    t.bigint "project_report_id", null: false
    t.bigint "user_id", null: false
    t.string "role", default: "developer", null: false
    t.decimal "hourly_wage", precision: 8, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_project_report_roles_on_discarded_at"
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
    t.string "name", null: false
    t.string "file_path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_project_reports_on_discarded_at"
    t.index ["project_id"], name: "index_project_reports_on_project_id"
  end

  create_table "project_resource_assignments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "project_resource_id", null: false
    t.bigint "project_id", null: false
    t.bigint "vacation_id"
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.string "title"
    t.string "color"
    t.string "resource_rid", null: false
    t.integer "type", default: 1, null: false
    t.boolean "resizable", default: true
    t.boolean "movable", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_project_resource_assignments_on_discarded_at"
    t.index ["project_id"], name: "index_project_resource_assignments_on_project_id"
    t.index ["project_resource_id"], name: "index_project_resource_assignments_on_project_resource_id"
    t.index ["user_id"], name: "index_project_resource_assignments_on_user_id"
    t.index ["vacation_id"], name: "index_project_resource_assignments_on_vacation_id"
  end

  create_table "project_resources", force: :cascade do |t|
    t.bigint "user_id"
    t.integer "project_resource_id"
    t.string "rid", null: false
    t.string "name", null: false
    t.boolean "group_only", default: false, null: false
    t.string "parent_rid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_project_resources_on_discarded_at"
    t.index ["user_id"], name: "index_project_resources_on_user_id"
  end

  create_table "projects", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "internal", default: false, null: false
    t.string "color", default: "000000", null: false
    t.boolean "work_times_allows_task", default: false, null: false
    t.bigint "leader_id"
    t.boolean "autofill", default: false, null: false
    t.boolean "lunch", default: false, null: false
    t.boolean "count_duration", default: true, null: false
    t.boolean "external_integration_enabled", default: false, null: false
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_projects_on_discarded_at"
    t.index ["leader_id"], name: "index_projects_on_leader_id"
    t.index ["name"], name: "index_projects_on_name", unique: true
  end

  create_table "remote_works", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "creator_id", null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.integer "duration", null: false
    t.text "note"
    t.boolean "updated_by_admin", default: false, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "discarded_at"
    t.index ["creator_id"], name: "index_remote_works_on_creator_id"
    t.index ["discarded_at"], name: "index_remote_works_on_discarded_at"
    t.index ["user_id"], name: "index_remote_works_on_user_id"
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
    t.boolean "manager", default: false, null: false
    t.string "lang", default: "pl", null: false
    t.boolean "staff_manager", default: false, null: false
    t.date "birthdate"
    t.datetime "discarded_at"
    t.boolean "hardware_manager", default: false, null: false
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "vacation_interactions", force: :cascade do |t|
    t.bigint "vacation_id", null: false
    t.bigint "user_id", null: false
    t.string "action", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_vacation_interactions_on_user_id"
    t.index ["vacation_id"], name: "index_vacation_interactions_on_vacation_id"
  end

  create_table "vacation_periods", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "starts_at", null: false
    t.date "ends_at", null: false
    t.integer "vacation_days", null: false
    t.text "note", default: ""
    t.boolean "closed", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_vacation_periods_on_user_id"
  end

  create_table "vacations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.string "vacation_type", null: false
    t.string "description"
    t.string "status", default: "unconfirmed", null: false
    t.string "vacation_sub_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "self_declined", default: false, null: false
    t.integer "business_days_count", null: false
    t.index ["user_id"], name: "index_vacations_on_user_id"
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
    t.integer "creator_id", null: false
    t.boolean "updated_by_admin", default: false, null: false
    t.string "task"
    t.jsonb "integration_payload"
    t.string "tag", default: "dev", null: false
    t.integer "vacation_id"
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_work_times_on_discarded_at"
  end

  add_foreign_key "accounting_periods", "users", name: "accounting_periods_user_id_fk"
  add_foreign_key "accounting_periods_recounts", "users"
  add_foreign_key "combined_reports", "projects"
  add_foreign_key "combined_reports_project_reports", "combined_reports"
  add_foreign_key "combined_reports_project_reports", "project_reports"
  add_foreign_key "external_auths", "projects"
  add_foreign_key "external_auths", "users"
  add_foreign_key "hardware_fields", "hardwares"
  add_foreign_key "hardwares", "users"
  add_foreign_key "project_report_roles", "project_reports"
  add_foreign_key "project_report_roles", "users"
  add_foreign_key "project_reports", "projects"
  add_foreign_key "project_resource_assignments", "project_resources"
  add_foreign_key "project_resource_assignments", "projects"
  add_foreign_key "project_resource_assignments", "users"
  add_foreign_key "project_resource_assignments", "vacations"
  add_foreign_key "project_resources", "users"
  add_foreign_key "projects", "users", column: "leader_id"
  add_foreign_key "remote_works", "users"
  add_foreign_key "remote_works", "users", column: "creator_id"
  add_foreign_key "vacation_interactions", "users"
  add_foreign_key "vacation_interactions", "vacations"
  add_foreign_key "vacation_periods", "users"
  add_foreign_key "vacations", "users"
  add_foreign_key "work_times", "projects", name: "work_times_project_id_fk"
  add_foreign_key "work_times", "users", column: "creator_id", name: "work_times_creator_id_fk"
  add_foreign_key "work_times", "users", name: "work_times_user_id_fk"
  add_foreign_key "work_times", "vacations", name: "work_times_vacation_id_fk"
end
