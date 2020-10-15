import React from 'react';
import PropTypes from 'prop-types';

function RangeFilter(props) {
  const { range, setRange } = props;

  function renderOption(value) {
    const label = value ? `${I18n.t('apps.projects.last')} ${String(value)} ${I18n.t('apps.projects.days')}` : I18n.t('common.all');
    return (
      <option value={value}>
        {label}
      </option>
    );
  }

  return (
    <select value={range} name="range" className="form-control" onChange={(e) => setRange(e.target.value)}>
      {renderOption('30')}
      {renderOption('60')}
      {renderOption('90')}
      {renderOption('')}
    </select>
  );
}

RangeFilter.propTypes = {
  range: PropTypes.string.isRequired,
  setRange: PropTypes.func.isRequired,
};

export default RangeFilter;
