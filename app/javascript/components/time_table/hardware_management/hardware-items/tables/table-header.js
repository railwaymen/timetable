import React from 'react';

export default function TableHeader() {
  return (
    <thead>
      <tr>
        <th>{I18n.t('apps.hardware_devices.category')}</th>
        <th>{I18n.t('apps.hardware_devices.brand')}</th>
        <th>{I18n.t('apps.hardware_devices.model')}</th>
        <th>{I18n.t('apps.hardware_devices.serial_number')}</th>
        <th>{I18n.t('apps.hardware_devices.assigned_person')}</th>
        <th>{I18n.t('apps.hardware_devices.state')}</th>
        <th>{I18n.t('apps.hardware_devices.year_of_production')}</th>
        <th>{I18n.t('common.action')}</th>
      </tr>
    </thead>
  );
}
