import React from 'react';
import Button from '../shared/button';

export default function StickyMenu({ onCancel, onSubmit, onGenerate }) {
  return (
    <div className="sticky-menu">
      <Button onClick={onCancel}>{I18n.t('common.cancel')}</Button>
      <Button onClick={onGenerate} type="help">{I18n.t('common.generate')}</Button>
      <Button onClick={onSubmit} type="primary">{I18n.t('apps.hardware_devices.save_item')}</Button>
    </div>
  );
}
