import React from 'react';

export default function Select({
  name, placeholder, options, value, onChange,
}) {
  return (
    <div className="input-wrapper">
      <label htmlFor={name} className="placeholder-wrapper">
        {placeholder}
        :
      </label>
      <div className="value-wrapper">
        <select id={name} name={name} onChange={onChange} defaultChecked={value} defaultValue={value} value={value}>
          {options.map((option) => (
            typeof option === 'object' ? <option value={option.id}>{option.name}</option> : <option value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
