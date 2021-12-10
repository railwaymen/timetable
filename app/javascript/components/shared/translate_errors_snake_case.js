const translateErrorsSnakeCase = (modelName, errors) => {
  const result = Object();
  Object.keys(errors).forEach((key) => {
    result[key] = errors[key].map(
      (errorObject) => I18n.t(['activerecord.errors.models', modelName, 'attributes', key, errorObject.error].join('.')),
    );
  });
  return result;
};

export default translateErrorsSnakeCase;
