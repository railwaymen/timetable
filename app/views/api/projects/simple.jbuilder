json.array! @projects do |project|
  json.call project, :id, :name, :internal, :active, :work_times_allows_task, :color, :lunch, :autofill, :count_duration
end
