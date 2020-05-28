import React from 'react';
import PropTypes from 'prop-types';
import ErrorTooltip from '@components/shared/error_tooltip';

function VacationPeriodFields(props) {
  const {
    period, onVacationPeriodChange, errors,
  } = props;

  return (
    <>
      { errors.vacationDays && (
        <ErrorTooltip errors={errors.vacationDays} />
      )}
      <div className="form-group">
        <input
          className={`${errors.vacationDays ? 'error' : ''} form-control`}
          type="number"
          name="vacation_days"
          placeholder={I18n.t('apps.vacation_periods.vacation_days')}
          onChange={onVacationPeriodChange}
          value={period.vacation_days}
          disabled={period.closed}
        />
      </div>
      <div className="form-group">
        <textarea
          className="form-control"
          name="note"
          placeholder={I18n.t('apps.vacation_periods.note')}
          onChange={onVacationPeriodChange}
          value={period.note}
          disabled={period.closed}
        />
      </div>
      <div className="form-group">
        <label className="form-check-label">
          <input type="checkbox" name="closed" checked={period.closed} onChange={onVacationPeriodChange} />
          <span className="checkbox" />
          <span className="ch-txt">
            {I18n.t('apps.vacation_periods.closed')}
            <i className="symbol state-symbol fa fa-lock" />
          </span>
        </label>
      </div>
    </>
  );
}

VacationPeriodFields.propTypes = {
  period: PropTypes.object.isRequired,
  onVacationPeriodChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default VacationPeriodFields;
