import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { defaultDatePickerProps } from './helpers';

const dateFormat = 'DD/MM/YYYY';
const DateRangeFilter = ({
  from, to, onFromChange, onToChange, onFilter, className, children,
}) => (
  <div className={className}>
    <div className="col-xs-3">
      <DatePicker {...defaultDatePickerProps} className="form-control" dateFormat={dateFormat} selected={moment(from)} onChange={onFromChange} name="from" placeholder="from" />
    </div>
    <div className="col-xs-3">
      <DatePicker {...defaultDatePickerProps} className="form-control" dateFormat={dateFormat} selected={moment(to)} onChange={onToChange} name="to" placeholder="to" />
    </div>
    <div className="col-xs-2">
      <div className="btn btn-default filter" onClick={onFilter}>
        {I18n.t('apps.reports.filter')}
      </div>
    </div>
    <div className="col-xs-4">
      {children}
    </div>
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
