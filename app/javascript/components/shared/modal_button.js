import React from 'react';
import PropTypes from 'prop-types';

const ModalButton = ({
  id, btnClass, content, onClick, props,
}) => (
  <button type="button" className={btnClass} data-toggle="modal" data-target={`#${id}`} onClick={onClick} {...props}>
    {content}
  </button>
);

ModalButton.propTypes = {
  id: PropTypes.string,
  btnClass: PropTypes.string,
  content: PropTypes.node,
  onClick: PropTypes.func,
};

export default ModalButton;
