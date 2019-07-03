import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { defaultDatePickerProps } from './helpers';

const dateFormat = 'DD/MM/YYYY';
const DateRangeFilter = ({
  from, to, onFromChange, onToChange, onFilter, className = '', children,
}) => (
  <div className={`date-range-filter ${className}`}>
    <DatePicker {...defaultDatePickerProps} className="form-control" dateFormat={dateFormat} selected={moment(from)} onChange={onFromChange} name="from" placeholderText={I18n.t('common.from')} />
    <DatePicker {...defaultDatePickerProps} className="form-control" dateFormat={dateFormat} selected={moment(to)} onChange={onToChange} name="to" placeholderText={I18n.t('common.to')} />
    <button type="button" className="btn btn-default filter" onClick={onFilter}>
      {I18n.t('apps.reports.filter')}
    </button>
    {children}
  </div>
);

DateRangeFilter.defaultProps = {
  className: '',
};
DateRangeFilter.propTypes = {
  className: PropTypes.string,
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  onFromChange: PropTypes.func.isRequired,
  onToChange: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default DateRangeFilter;
