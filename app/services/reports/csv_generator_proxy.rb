# frozen_string_literal: true

module Reports
  class CsvGeneratorProxy
    def self.call(params:, user:)
      project = (Project.find(params[:id]) if params.key?(:id))
      service_params = { params: params, user: user, project: project }

      if project&.vacation? || project&.zks?
        CsvDateRangeGeneratorService.new(**service_params)
      else
        CsvGeneratorService.new(**service_params)
      end
    end
  end
end
