import React from 'react';
import StringHelper from '../../../../helpers/string-helper';

export default function Tag({ children }) {
  const value = StringHelper.isBlank(children) ? 'not_selected' : children;
  const translatedValue = I18n.t(`apps.hardware_devices.${value}`)

  return (
    <div className={`tag ${value}`}>
      {translatedValue}
    </div>
  );
}
