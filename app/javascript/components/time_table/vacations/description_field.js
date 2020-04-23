import React from 'react';
import PropTypes from 'prop-types';
import ErrorTooltip from '@components/shared/error_tooltip';

function Description(props) {
  const {
    description, onVacationChange, onKeyPress, errors,
  } = props;

  return (
    <div className="description w-100">
      {errors.description && <ErrorTooltip errors={errors.description} className="vacation-errors" />}
      <textarea
        className="form-control w-100"
        placeholder={I18n.t('apps.vacations.vacation_description')}
        name="description"
        value={description}
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
};

export default Description;
