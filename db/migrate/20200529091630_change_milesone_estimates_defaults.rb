class ChangeMilesoneEstimatesDefaults < ActiveRecord::Migration[6.0]
  def change
    change_column_default :milestone_estimates, :dev_estimate, from: nil, to: 0
    change_column_default :milestone_estimates, :qa_estimate, from: nil, to: 0
    change_column_default :milestone_estimates, :ux_estimate, from: nil, to: 0
    change_column_default :milestone_estimates, :pm_estimate, from: nil, to: 0
    change_column_default :milestone_estimates, :other_estimate, from: nil, to: 0
    change_column_default :milestone_estimates, :external_estimate, from: nil, to: 0
    change_column_default :milestone_estimates, :total_estimate, from: nil, to: 0

  end
end
