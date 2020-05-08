import React from 'react';
import PropTypes from 'prop-types';

const ModalButton = ({
  id, btnClass, content,
}) => (
  <button type="button" className={btnClass} data-toggle="modal" data-target={`#${id}`}>
    {content}
  </button>
);

ModalButton.propTypes = {
  id: PropTypes.string,
  btnClass: PropTypes.string,
  content: PropTypes.node,
};

export default ModalButton;
