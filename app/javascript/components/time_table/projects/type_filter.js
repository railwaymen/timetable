import React from 'react';
import PropTypes from 'prop-types';

function TypeFilter(props) {
  const { type, setType } = props;

  function renderOption(value) {
    return (
      <option value={value}>
        {I18n.t(value, { scope: 'apps.projects.type' })}
      </option>
    );
  }

  return (
    <select value={type} className="form-control" onChange={(e) => setType(e.target.value)}>
      {renderOption('commercial')}
      {renderOption('internal')}
      {renderOption('all')}
    </select>
  );
}

TypeFilter.propTypes = {
  type: PropTypes.string.isRequired,
  setType: PropTypes.func.isRequired,
};

export default TypeFilter;
