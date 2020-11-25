import React from 'react';
import PropTypes from 'prop-types';

export default function Warnings({ warnings, status }) {
  const classes = status ? `warning-border ${status}` : 'border border-warning text-warning mb-3';
  return (
    <div>
      {
        warnings.map((warning, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={warning + index} className={`px-2 py-1 d-block text-center ${classes}`}>{warning}</div>
        ))
      }
    </div>
  );
}
Warnings.propTypes = { warnings: PropTypes.array.isRequired, status: PropTypes.string };
