import React from 'react';
import PropTypes from 'prop-types';

function VisibilityFilter(props) {
  const { visibility, setVisibility } = props;

  return (
    <select
      name="visibility"
      id="filter"
      className="form-control"
      onChange={(e) => setVisibility(e.target.value)}
      value={visibility}
    >
      <option value="active">{I18n.t('apps.projects.filter_active')}</option>
      <option value="inactive">{I18n.t('apps.projects.filter_inactive')}</option>
      <option value="all">{I18n.t('apps.projects.filter_all')}</option>
    </select>
  );
}

VisibilityFilter.propTypes = {
  visibility: PropTypes.string.isRequired,
  setVisibility: PropTypes.func.isRequired,
};

export default VisibilityFilter;
