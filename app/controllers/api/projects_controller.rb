module Api
  class ProjectsController < AuthenticatedController
    respond_to :json
    wrap_parameters :project
    before_action :authenticate_admin_or_manager_or_leader!, only: %i[show create update]

    def index
      range = params[:range].presence_in(valid_days) || 30
      @projects = ProjectRate.stats(starts_at: range.to_i.days)

      respond_with @projects
    end

    def list
      action = params[:display].presence_in(visiblity_list) || 'active'
      @projects = projects_scope.filter_by action.to_sym
    end

    def simple
      @projects = Project.order(:internal, :name)
      respond_with @projects
    end

    def show
      @project = project_scope
    end

    def create
      @project = Project.create(project_params)
      respond_with :api, @project
    end

    def update
      @project = project_scope
      @project.update(project_params)
      respond_with @project
    end

    private

    def visiblity_list
      %w[all inactive active]
    end

    def valid_days
      %w[30 60 90]
    end

    def project_scope
      @project_scope ||= begin
        if current_user.admin? || current_user.manager?
          Project.find(params[:id])
        else
          current_user.projects.find(params[:id])
        end
      end
    end

    def projects_scope
      @projects_scope ||= Project.includes(:leader).order(name: :asc)
    end

    def project_params
      current_user.admin? || current_user.manager? ? admin_project_params : leader_project_params
    end

    def leader_project_params
      params.require(:project).permit(:color, :work_times_allows_task)
    end

    def admin_project_params
      params.require(:project)
            .permit(:name, :color, :leader_id, :active, :work_times_allows_task)
    end
  end
end
