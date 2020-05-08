import React from 'react';
import PropTypes from 'prop-types';

const Modal = ({
  id, header, content, actions,
}) => (
  <div className="modal fade" id={id} tabIndex="-1" role="dialog" aria-labelledby={`${id}ExampleModalLabel`} aria-hidden="true">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id={`${id}ExampleModalLabel`}>{header}</h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          {content}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-dismiss="modal">
          {I18n.t('common.close')}
          </button>
          {actions}
        </div>
      </div>
    </div>
  </div>
);

Modal.propTypes = {
  id: PropTypes.string,
  header: PropTypes.node,
  content: PropTypes.node,
  actions: PropTypes.node,
};

export default Modal;
