import React from 'react';

export default function ContentValue({
  placeholder, value, classNameElement = '',
}) {
  return (
    <div className="input-wrapper">
      <div className={`${classNameElement} placeholder-wrapper`}>
        {placeholder}
        :
      </div>
      <div className={`${classNameElement} value-wrapper`}>
        <b>{value}</b>
      </div>
    </div>
  );
}
