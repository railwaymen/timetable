import React from 'react';
import PropTypes from 'prop-types';

function SortOptions(props) {
  const { sort, setSort } = props;

  function renderOption(value) {
    return (
      <option value={value}>
        {I18n.t(value, { scope: 'apps.projects.sort' })}
      </option>
    );
  }

  return (
    <select value={sort} name="sort" className="form-control" onChange={(e) => setSort(e.target.value)}>
      {renderOption('hours')}
      {renderOption('alphabetical')}
    </select>
  );
}

SortOptions.propTypes = {
  sort: PropTypes.string.isRequired,
  setSort: PropTypes.func.isRequired,
};

export default SortOptions;
