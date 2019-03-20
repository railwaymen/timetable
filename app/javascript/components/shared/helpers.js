import React from 'react';

export const preserveLines = string => string.split("\n").map((line, idx) => (
  <p key={idx}>{line}</p>
));

export const unnullifyFields = (object) => {
  const result = {};
  for (let field in object) {
    if (object[field] === null) {
      result[field] = '';
    } else {
      result[field] = object[field]
    }
  }
  return result;
};

export const popperModifiers = {
  computeStyle: { gpuAcceleration: false }
};

export const defaultDatePickerProps = {
  popperModifiers,
  autoComplete: 'off',
  locale: 'pl'
}
