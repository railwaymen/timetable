import React from 'react';

export default function Tag({ children }) {
  return (
    <div className={`tag ${children}`}>
      {I18n.t(`apps.hardware_devices.${children}`)}
    </div>
  );
}
