import React from 'react';
import PropTypes from 'prop-types';

// TODO: this modal should be replaced with '@components/shared/modal'
const Modal = ({
  id, header, content, actions,
}) => (
  <div id={id} className="unique-modal-class" style={{ display: 'none' }}>
    <div className="ui centered-modal modal transition visible active">
      <i className="close icon" />
      <div className="header">{header}</div>
      <div className="content">
        {content}
      </div>
      <div className="actions">
        {actions}
      </div>
    </div>
    <div className="ui dimmer modals modal-backdrop page transition visible active" style={{ display: 'flex !important' }} />
  </div>
);

Modal.propTypes = {
  id: PropTypes.string,
  header: PropTypes.node,
  content: PropTypes.node,
  actions: PropTypes.node,
};

export default Modal;
