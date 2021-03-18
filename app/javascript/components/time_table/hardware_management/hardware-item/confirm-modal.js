import React from 'react';
import Button from '../shared/button';
import Modal from './modal';

export default function ConfirmModal({
  children, onCancel, onConfirm, confirmTitle = I18n.t('common.confirm'), cancelTitle = I18n.t('common.cancel'), visible, title,
}) {
  return (
    <Modal visible={visible} onClose={onCancel}>
      <div className="prompt">
        <h4>{title}</h4>
        {children}
        <div className="actions">
          <Button onClick={onCancel} className="space-lg">{cancelTitle}</Button>
          <Button onClick={onConfirm} type="danger" className="danger">{confirmTitle}</Button>
        </div>
      </div>
    </Modal>
  );
}
