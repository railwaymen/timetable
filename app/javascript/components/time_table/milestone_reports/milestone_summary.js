import _ from 'lodash';
import React from 'react';
import { departmentColors } from '../../shared/constants';
import { formattedDuration } from '../../shared/helpers';

function MilestoneSummary(props) {
  const {
    workTimesSumByType,
    workTimes,
    milestone,
    selectedDepartment,
    setSelectedDepartment,
  } = props;
  const departments = ['dev', 'qa', 'ux', 'pm', 'other'];

  const totalValue = _.sum(_.values(workTimesSumByType));
  const jiraTotal = _.sumBy(_.filter(workTimes, 'external_id'), 'duration');

  function onDepartmentLabelClick(department) {
    if (department === selectedDepartment) {
      setSelectedDepartment(null);
    } else {
      setSelectedDepartment(department);
    }
  }

  function Selected() {
    return (
      <div className="position-absolute h-100 selected-border" />
    );
  }

  function renderDepartmentSummary(department) {
    const currentValue = workTimesSumByType[department];
    const estimatedValue = milestone && milestone[`${department}_estimate`] ? milestone[`${department}_estimate`] : 1;
    const percentage = !currentValue ? 0 : (currentValue / estimatedValue) * 100;

    return (
      <div key={department} className="row position-relative">
        {department === selectedDepartment && <Selected />}
        <div className="col-1 font-weight-bold cursor-pointer" onClick={() => onDepartmentLabelClick(department)}>
          {I18n.t(department, { scope: 'apps.department' })}
        </div>
        <div className="col-1">{formattedDuration(currentValue)}</div>
        {
          milestone && (
            <>
              <div className="col-9">
                <div className="progress milestone-progress">
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
                <div className="progress milestone-progress">
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

  function onTotalClick() {
    if (selectedDepartment) { setSelectedDepartment(null); }
  }

  function renderTotalSummary() {
    const estimatedValue = milestone && milestone.total_estimate ? milestone.total_estimate : 1;
    const percentage = !totalValue ? 0 : (totalValue / estimatedValue) * 100;

    return (
      <div className="row bg-light">
        <div className="col-1 font-weight-bold cursor-pointer" onClick={onTotalClick}>{I18n.t('common.total')}</div>
        <div className="col-1">{formattedDuration(totalValue)}</div>
        {
          milestone && (
            <>
              <div className="col-9">
                <div className="progress milestone-progress">
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
    <div className="progress-by-department">
      {departments.map((department) => (
        renderDepartmentSummary(department)
      ))}
      {renderTotalSummary()}
      {renderJiraSummary()}
    </div>
  );
}

export default MilestoneSummary;
