import React from 'react';

export default function Select({
  name, placeholder, options, value, onChange, translatable = false, optionName = 'name', innerClassName,
}) {
  return (
    <div className="input-wrapper">
      <label htmlFor={name} className="placeholder-wrapper">
        {placeholder}
        :
      </label>
      <div className={`value-wrapper ${innerClassName}`}>
        <select id={name} name={name} onChange={onChange} defaultChecked={value} defaultValue={value} value={value}>
          {options.map((option) => (
            typeof option === 'object' ? (
              <option value={option.id}>{option[optionName]}</option>
            ) : (
              <option value={option}>{translatable ? I18n.t(`apps.hardware_devices.${option}`) : option}</option>
            )
          ))}
        </select>
      </div>
    </div>
  );
}
