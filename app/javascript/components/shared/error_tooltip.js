import React from 'react';
import PropTypes from 'prop-types';

const ErrorTooltip = ({ errors }) => (
  <div className="error-tooltip">
    <ul>
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  </div>
);

ErrorTooltip.propTypes = {
  errors: PropTypes.array.isRequired,
};

export default ErrorTooltip;
