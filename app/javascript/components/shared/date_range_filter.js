import React from 'react';
import PropTypes from 'prop-types';
import { defaultDatePickerProps } from './helpers';
import DatePicker from 'react-datepicker';

const dateFormat = 'DD/MM/YYYY';
const DateRangeFilter = ({ from, to, onFromChange, onToChange, onFilter, className }) => (
  <div className={className}>
    <div className="col-xs-3">
      <DatePicker {...defaultDatePickerProps} className="form-control" dateFormat={dateFormat} selected={moment(from)} onChange={onFromChange} name="from" placeholder="from" />
    </div>
    <div className="col-xs-3">
      <DatePicker {...defaultDatePickerProps} className="form-control" dateFormat={dateFormat} selected={moment(to)} onChange={onToChange} name="to" placeholder="to" />
    </div>
    <div className="btn btn-default filter" onClick={onFilter}>
      {I18n.t('apps.reports.filter')}
    </div>
  </div>
);

DateRangeFilter.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  onFromChange: PropTypes.func,
  onToChange: PropTypes.func,
  onFilter: PropTypes.func,
}

export default DateRangeFilter;