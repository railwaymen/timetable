import React from 'react';
import PropTypes from 'prop-types';


const HorizontalArrows = ({
  onLeftClick, onRightClick, children, className = '',
}) => (
  <div className={`horizontal-arrows ${className}`}>
    <button
      type="button"
      key={0}
      className="btn btn-link glyphicon glyphicon-chevron-left previous"
      onClick={onLeftClick}
    />
    {children}
    <button
      type="button"
      key={1}
      className="btn btn-link glyphicon glyphicon-chevron-right next"
      onClick={onRightClick}
    />
  </div>
);

HorizontalArrows.propTypes = {
  onLeftClick: PropTypes.func,
  onRightClick: PropTypes.func,
};

export default HorizontalArrows;
