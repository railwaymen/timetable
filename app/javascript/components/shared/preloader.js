import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

function Preloader(props) {
  const { rowsNumber } = props;

  return (
    <div style={{ width: '100%' }}>
      {_.times(rowsNumber, (number) => (
        <div className="form-group" key={number}>
          <div className="preloader" />
        </div>
      ))}
    </div>
  );
}

Preloader.propTypes = {
  rowsNumber: PropTypes.number.isRequired,
};

export default Preloader;
