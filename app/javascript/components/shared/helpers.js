import React from 'react';
import moment from 'moment';
import padStart from 'lodash/padStart';
import URI from 'urijs';

export const preserveLines = (string) => string.split('\n').map((line, idx) => (
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

const padZeroes = (input) => padStart(String(input), 2, '0');

export const displayDuration = (seconds) => {
  const duration = moment.duration(Math.abs(seconds), 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

  return `${padZeroes(hours)}:${padZeroes(minutes)}`;
};

export const displayDate = (date) => moment(date).format('ddd DD, MMMM YYYY');

export const displayDayInfo = (day) => {
  const today = moment();
  const yesterday = moment().subtract(1, 'day');

  if (today.isSame(day, 'day')) {
    return I18n.t('common.today');
  } if (yesterday.isSame(day, 'day')) {
    return I18n.t('common.yesterday');
  }
  return displayDate(day);
};

export const formattedDuration = (value) => {
  if (!value || parseInt(value, 10) === 0) {
    return '00:00';
  }
  return displayDuration(value);
};

export const countDurationPercentage = (duration, total) => `${Math.floor((duration * 10000) / total) / 100}%`;

export const locationParams = () => {
  const href = URI(window.location.href);
  return href.query(true);
};

export const replaceLocationParams = (params) => {
  const href = URI(window.location.href);
  const currentParams = href.query(true);
  const newParams = { ...currentParams, ...params };
  window.history.pushState('Timetable', '', href.search(newParams));
};

export const extractIntegrationPayload = (payload) => {
  if (payload && payload.Jira) {
    return { type: payload.Jira.issue_type, labels: payload.Jira.labels };
  }

  return { type: '', labels: [] };
};

export const formattedHoursAndMinutes = (time) => moment(time).format('HH:mm');

export const inclusiveParse = (time) => {
  const firstFormat = moment(time, 'HH:mm');
  if (firstFormat.isValid()) {
    return firstFormat;
  }

  // Properly handly input without '0' prefix, for example '830' -> 08:30
  return moment(time, 'Hmm');
};
