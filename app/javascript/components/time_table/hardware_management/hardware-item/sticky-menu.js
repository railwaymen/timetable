import React from 'react';
import Button from '../shared/button';

export default function StickyMenu({ onCancel, onSubmit }) {
  return (
    <div className="sticky-menu">
      <Button onClick={onCancel}>{I18n.t('common.cancel')}</Button>
      <Button onClick={onSubmit} type="primary">{I18n.t('apps.hardware_devices.save_item')}</Button>
    </div>
  );
}
