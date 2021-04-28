import React from 'react';
import Select from 'react-select';

function InputWrap({ name, children, placeholder }) {
  return (
    <div className="input-wrapper">
      <label htmlFor={name} className="placeholder-wrapper">
        {placeholder}
        :
      </label>
      <div className="value-wrapper">
        {children}
      </div>
    </div>
  );
}

export default function SelectFilter({
  name, placeholder, options, value, onChange,
}) {
  const onOptionChange = ({ value: selectedValue }) => {
    onChange({ target: { name, value: selectedValue } });
  };

  const selectOptions = options.map(({ name: optionName, id }) => ({ label: optionName, value: id }));
  const selectedOption = selectOptions.find((option) => option.value === value);

  return (
    <InputWrap name={name} placeholder={placeholder}>
      <Select
        className="select-list"
        value={selectedOption}
        onChange={onOptionChange}
        options={selectOptions}
      />
    </InputWrap>
  );
}
