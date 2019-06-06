import React from 'react';
import PropTypes from 'prop-types';


const HorizontalArrows = ({ onLeftClick, onRightClick, children, className }) => (
  <div className={'horizontal-arrows '+(className ? className : '')}>
    <a key={0} className="glyphicon glyphicon-chevron-left previous" href="javascript:void(0)" onClick={onLeftClick} />
    {children}
    <a key={1} className="glyphicon glyphicon-chevron-right next" href="javascript:void(0)" onClick={onRightClick} />
  </div>
);

HorizontalArrows.propTypes = {
  onLeftClick: PropTypes.func,
  onRightClick: PropTypes.func,
};

export default HorizontalArrows;
