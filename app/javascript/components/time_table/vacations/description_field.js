import React from 'react';
import PropTypes from 'prop-types';

function Description(props) {
  const {
    description, onVacationChange, onKeyPress, errors, ErrorTooltip,
  } = props;

  return (
    <div className="description">
      {errors.description && <ErrorTooltip specificErrors={errors.description} />}
      <textarea
        className="form-control"
        placeholder={I18n.t('apps.vacations.vacation_description')}
        name="description"
        defaultValue={description}
        onChange={(e) => onVacationChange('description', e.target.value)}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}

Description.propTypes = {
  description: PropTypes.string,
  onVacationChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  ErrorTooltip: PropTypes.func.isRequired,
};

export default Description;
