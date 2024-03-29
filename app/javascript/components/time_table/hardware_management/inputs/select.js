import React from 'react';

export default function Select({
  name, placeholder, options, value, onChange, translatable = false, optionName = 'name', innerClassName, errors = [],
}) {
  return (
    <div className="input-wrapper">
      <label htmlFor={name} className="placeholder-wrapper">
        {placeholder}
        :
      </label>
      <div className={`value-wrapper ${innerClassName}`}>
        <select id={name} name={name} onChange={onChange} value={value}>
          {options.map((option) => (
            typeof option === 'object' ? (
              <option key={option.id} value={option.id}>{option[optionName]}</option>
            ) : (
              <option key={option} value={option}>{translatable ? I18n.t(`apps.hardware_devices.${option}`) : option}</option>
            )
          ))}
        </select>
        <span className="error space-md">{errors?.join(', ')}</span>
      </div>
    </div>
  );
}
