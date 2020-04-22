import React from 'react';
import PropTypes from 'prop-types';

const ErrorTooltip = ({ errors, className = '' }) => (
  <div className={`error-tooltip ${className}`}>
    <ul>
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  </div>
);

ErrorTooltip.propTypes = {
  errors: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default ErrorTooltip;
