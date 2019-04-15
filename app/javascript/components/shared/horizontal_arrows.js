import React from 'react';
import PropTypes from 'prop-types';


const HorizontalArrows = ({ onLeftClick, onRightClick, children }) => (
  [
    <a key={0} className="glyphicon glyphicon-chevron-left previous pull-left" href="javascript:void(0)" onClick={onLeftClick}></a>,
    ...React.Children.toArray(children),
    <a key={1} className="glyphicon glyphicon-chevron-right next pull-left" href="javascript:void(0)" onClick={onRightClick}></a>,
  ]
);

HorizontalArrows.propTypes = {
  onLeftClick: PropTypes.func,
  onRightClick: PropTypes.func,
}

export default HorizontalArrows;