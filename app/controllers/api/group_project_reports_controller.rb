# frozen_string_literal: true

module Api
  class GroupProjectReportsController < Api::BaseController
    respond_to :json

    def create
      project.group_project_reports.create!(group_project_reports_prams)
    end
    
    def index
      @group_project_reports = project.group_project_reports
      respond_with @group_project_reports
    end

    def show 
     @group_project_report = project.group_project_reports.find(params[:id])
     respond_with @group_project_report
    end

    private

    def project
     @project ||= Project.find(params[:project_id])
    end

    def group_project_reports_prams
      
    end
  end
end