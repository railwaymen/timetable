import React from 'react';
import moment from 'moment';
import padStart from 'lodash/padStart';

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

export const displayDuration = (seconds) => {
  const time = moment.duration(seconds, 'seconds');
  let hours = time.hours() + time.days() * 24;
  let minutes = time.minutes();
  const padZeroes = (input) => padStart(String(input), 2, '0');

  return `${padZeroes(hours)}:${padZeroes(minutes)}`;
};
