module WorkTimeHelper
  def task_preview_helper(task)
    /([aA-zZ1-9]+)$/.match(task).to_s
  end
end
