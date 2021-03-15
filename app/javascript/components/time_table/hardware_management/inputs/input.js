import React from 'react';

export default function Input({
  name, placeholder, value, onChange, type = 'text', disabled = false, id = null, errors = [],
}) {
  return (
    <div className="input-wrapper">
      <label htmlFor={id || name} className="placeholder-wrapper">
        {placeholder}
        :
      </label>
      <div className="value-wrapper">
        <input
          className={`${errors.length !== 0 ? 'input-error' : ''}`}
          disabled={disabled}
          onChange={onChange}
          id={id || name}
          name={name}
          type={type}
          value={value}
        />
        <span className="error space-md">{errors?.join(', ')}</span>
      </div>
    </div>
  );
}
