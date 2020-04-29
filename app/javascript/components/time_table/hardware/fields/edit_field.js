import React from 'react';
import PropTypes from 'prop-types';
import Errors from '../errors';

const EditField = ({
  field,
  onChange,
  onSave,
  setEdit,
  errors,
}) => (
  <div>
    <form onSubmit={onSave}>
      <div className="form-group">
        <label
          className="font-weight-bold"
          htmlFor="name"
        >
          {I18n.t('apps.hardware.field.name')}
        </label>
        <input
          name="name"
          type="text"
          className="form-control"
          value={field.name}
          onChange={onChange}
        />
        {errors.name && <Errors errors={errors.name} />}
      </div>
      <div className="form-group">
        <label className="font-weight-bold" htmlFor="value">
          {' '}
          {I18n.t('apps.hardware.field.value')}
        </label>
        <input
          name="value"
          type="text"
          className="form-control"
          value={field.value}
          onChange={onChange}
        />
        {errors.value && <Errors errors={errors.value} />}
      </div>
      <div className="btn-group">
        <button
          className="btn btn-success"
          type="submit"
        >
          <i className="fa fa-check mr-3" />
          {I18n.t('common.save')}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setEdit(false)}
        >
          <i className="fa fa-times mr-3" />
          {I18n.t('common.cancel')}
        </button>
      </div>
    </form>
    <hr />
  </div>
);

EditField.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  errors: PropTypes.object,
  setEdit: PropTypes.func.isRequired,
};

export default EditField;
