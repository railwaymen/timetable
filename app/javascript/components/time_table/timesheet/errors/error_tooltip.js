import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class ErrorTooltip extends React.Component {
  static propTypes = {
    errors: PropTypes.array
  }

  render () {
    return (
      <div className="error-tooltip">
        <ul>
          { this.props.errors.map((error, index) => (
            <li key={index}>{error}</li>
          )) }
        </ul>
      </div>
    )
  }
}

export default ErrorTooltip;
