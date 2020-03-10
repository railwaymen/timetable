class EventGenerator
  def generate
    Resource.where(group_only: false).each do |r|
      @start_date = Time.current.beginning_of_month
      while @start_date < Time.current.beginning_of_month + 3.months
        project = projects[Random.new.rand(projects.count)]
        interval = Random.new.rand(3) + 10
        end_date = @start_date + interval.days
        Event.create(user_id: r.user_id, project_id: project.id, resource_id: r.id, resource_rid: r.rid,
                     starts_at: @start_date, ends_at: end_date, title: project.name, color: "##{project.color}")
        @start_date = end_date
      end
    end
  end

  private

  def projects
    Project.where(lunch: false)
  end
end