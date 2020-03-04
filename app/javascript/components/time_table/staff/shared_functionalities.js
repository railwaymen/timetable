import React from 'react';

export function Errors({ errors }) {
  if (errors.length <= 0) { return null; }
  const errorList = [];
  errors.forEach((error) => {
    Object.keys(error).forEach((err) => {
      errorList.push(<div className={err} key={err}>{error[err]}</div>);
    });
  });

  return (
    <div className="row vacation-errors error-tooltip">
      {errorList}
    </div>
  );
}

export function Warnings({ warnings }) {
  if (warnings.length <= 0) { return null; }
  const warningsList = [];
  warnings.forEach((warning) => {
    Object.keys(warning).forEach((war) => {
      warningsList.push(<div className={war} key={war}>{warning[war]}</div>);
    });
  });

  return (
    <div className="row vacation-errors error-tooltip">
      {warningsList}
    </div>
  );
}

export function Interactions({ vacation }) {
  const approvers = [];
  const decliners = [];
  const vacationApprovers = vacation.approvers ? vacation.approvers.split(',').filter(Boolean) : [];
  const vacationDecliners = vacation.decliners ? vacation.decliners.split(',').filter(Boolean) : [];
  if (vacationApprovers) {
    for (let i = 0; i < vacationApprovers.length; i += 1) {
      approvers.push(
        <div className="approver" key={i}>
          {I18n.t('apps.staff.approved_by')}
          <span className="interactor-name">
            {` ${vacationApprovers[i]}`}
          </span>
        </div>,
      );
    }
  }
  if (vacationDecliners) {
    for (let i = 0; i < vacationDecliners.length; i += 1) {
      decliners.push(
        <div className="decliner" key={i}>
          {I18n.t('apps.staff.declined_by')}
          <span className="interactor-name">
            {` ${vacationDecliners[i]}`}
          </span>
        </div>,
      );
    }
  }
  return (
    <div className="interactions-list">
      {approvers}
      {decliners}
    </div>
  );
}
