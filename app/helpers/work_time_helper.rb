module WorkTimeHelper
  def task_preview_helper(task)
    return if task.blank?
    URI.parse(task).path.to_s.split('/').last
  end
end
