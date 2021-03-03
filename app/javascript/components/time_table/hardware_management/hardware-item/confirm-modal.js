import React from 'react';
import Button from '../shared/button';
import Modal from './modal';

export default function ConfirmModal({
  children, onCancel, onConfirm, confirmTitle = 'confirm', cancelTitle = 'cancel', visible, title,
}) {
  return (
    <Modal visible={visible} onClose={onCancel}>
      <div className="prompt">
        <h4>{title}</h4>
        {children}
        <div className="actions">
          <Button onClick={onCancel} className="space-lg">{cancelTitle}</Button>
          <Button onClick={onConfirm}>{confirmTitle}</Button>
        </div>
      </div>
    </Modal>
  );
}
