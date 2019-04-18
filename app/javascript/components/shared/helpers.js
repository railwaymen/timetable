import React from 'react';
import moment from 'moment';
import padStart from 'lodash/padStart';


export const preserveLines = string => string.split('\n').map((line, idx) => (
  <p key={idx}>{line}</p> // eslint-disable-line
));

export const unnullifyFields = (object) => {
  const result = {};
  Object.keys(object).forEach((field) => {
    if (object[field] === null) {
      result[field] = '';
    } else {
      result[field] = object[field];
    }
  });
  return result;
};

export const popperModifiers = {
  computeStyle: { gpuAcceleration: false },
};

export const defaultDatePickerProps = {
  popperModifiers,
  autoComplete: 'off',
  locale: 'pl',
};

export const displayDuration = (seconds) => {
  const time = moment.duration(seconds, 'seconds');
  const hours = time.hours() + time.days() * 24;
  const minutes = time.minutes();
  const padZeroes = input => padStart(String(input), 2, '0');

  return `${padZeroes(hours)}:${padZeroes(minutes)}`;
};

export const displayDayInfo = (day) => {
  const today = moment();
  const yesterday = moment().subtract(1, 'day');

  if (today.isSame(day, 'day')) {
    return I18n.t('common.today');
  } if (yesterday.isSame(day, 'day')) {
    return I18n.t('common.yesterday');
  }
  return moment(day).format('ddd DD, MMMM YYYY');
};
