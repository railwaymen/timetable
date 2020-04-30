import React from 'react';
import PropTypes from 'prop-types';

export default function Errors({ errors }) {
  return (
    <div>
      {
        errors.map((error, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={error + index} className="px-2 py-1 d-block border border-danger text-danger text-center">{error}</div>
        ))
      }
    </div>
  );
}
Errors.propTypes = { errors: PropTypes.array.isRequired };
