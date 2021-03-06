export const presence = (value) => {
  if (value === null || value === undefined || value === '') {
    return [I18n.t('errors.messages.blank')];
  }
  return undefined;
};

export const greaterThan = (number, value) => {
  if (value <= number) {
    return [I18n.t('errors.messages.greater_than', { count: number })];
  }
  return undefined;
};
