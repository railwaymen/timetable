import _ from 'lodash';
import React from 'react';
import { departmentColors } from '../../shared/constants';
import { formattedDuration } from '../../shared/helpers';

function MilestoneSummary(props) {
  const { workTimesSumByType, workTimes, milestone } = props;
  const departments = ['dev', 'qa', 'ux', 'pm', 'other'];

  const totalValue = _.sum(_.values(workTimesSumByType));
  const jiraTotal = _.sumBy(_.filter(workTimes, 'external_id'), 'duration');

  function renderDepartmentSummary(department) {
    const currentValue = workTimesSumByType[department];
    const estimatedValue = milestone && milestone[`${department}_estimate`] ? milestone[`${department}_estimate`] : 1;
    const percentage = !currentValue ? 0 : (currentValue / estimatedValue) * 100;

    return (
      <div key={department} className="row">
        <div className="col-1 font-weight-bold">{I18n.t(department, { scope: 'apps.department' })}</div>
        <div className="col-1">{formattedDuration(currentValue)}</div>
        {
          milestone && (
            <>
              <div className="col-9">
                <div className="progress">
                  <div className="progress-bar" role="progressbar" style={{ backgroundColor: departmentColors[department], width: `${percentage}%` }} />
                </div>
              </div>
              <div className="col-1">{formattedDuration(estimatedValue)}</div>
            </>
          )
        }
      </div>
    );
  }

  function renderJiraSummary() {
    const currentValue = jiraTotal;
    const estimatedValue = milestone && milestone.external_estimate ? milestone.external_estimate : 1;
    const percentage = !currentValue ? 0 : (currentValue / estimatedValue) * 100;

    return (
      <div className="row mt-2">
        <div className="col-1">JIRA</div>
        <div className="col-1">{formattedDuration(currentValue)}</div>
        {
          milestone && (
            <>
              <div className="col-9">
                <div className="progress">
                  <div className="progress-bar" role="progressbar" style={{ backgroundColor: departmentColors.jira, width: `${percentage}%` }} />
                </div>
              </div>
              <div className="col-1">{formattedDuration(milestone.external_estimate)}</div>
            </>
          )
        }
      </div>
    );
  }

  function renderTotalSummary() {
    const estimatedValue = milestone && milestone.total_estimate ? milestone.total_estimate : 1;
    const percentage = !totalValue ? 0 : (totalValue / estimatedValue) * 100;

    return (
      <div className="row bg-light">
        <div className="col-1 font-weight-bold">{I18n.t('common.total')}</div>
        <div className="col-1">{formattedDuration(totalValue)}</div>
        {
          milestone && (
            <>
              <div className="col-9">
                <div className="progress">
                  <div className="progress-bar" role="progressbar" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div className="col-1">{formattedDuration(milestone.total_estimate)}</div>
            </>
          )
        }
      </div>
    );
  }

  return (
    <div>
      {departments.map((department) => (
        renderDepartmentSummary(department)
      ))}
      {renderTotalSummary()}
      {renderJiraSummary()}
    </div>
  );
}

export default MilestoneSummary;
