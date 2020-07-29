import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makePostRequest } from '../../../shared/api';
import Errors from '../errors';
import useFormHandler from '../../../../hooks/use_form_handler';
import translateErrors from '../../../shared/translate_errors';

const CreateField = ({
  toggleExpand, expanded, hardware_id, updateFieldList,
}) => {
  const [field, setField, onChange] = useFormHandler({ name: '', value: '' });
  const [errors, setErrors] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();
    makePostRequest({
      url: `/api/hardwares/${hardware_id}/fields`,
      body: { field },
    }).then((response) => {
      updateFieldList(response.data);
      setErrors({});
      setField({ name: '', value: '' });
    }).catch((response) => {
      const translatedErrors = translateErrors('hardware_field', response.errors);
      setErrors(translatedErrors);
    });
  };

  if (expanded) {
    return (
      <div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="font-weight-bold" htmlFor="name">
              {I18n.t('apps.hardware.field.name')}
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              onChange={onChange}
            />
            {errors.name && <Errors errors={errors.name} />}
          </div>
          <div className="form-group">
            <label className="font-weight-bold" htmlFor="value">
              {I18n.t('apps.hardware.field.value')}
            </label>
            <input
              type="text"
              name="value"
              onChange={onChange}
              className="form-control"
            />
            {errors.value && <Errors errors={errors.value} />}
          </div>
          <hr />
          <div className="btn-group" role="group" aria-label="Save or cancel">
            <button
              type="submit"
              className="btn btn-success"
            >
              <i className="fa fa-check mr-3" />
              {I18n.t('common.save')}
            </button>
            <button
              type="button"
              className="btn btn-danger "
              onClick={toggleExpand}
            >
              <i className="fa fa-close mr-3" />
              {I18n.t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={toggleExpand}
    >
      <i className="fa fa-plus mr-3" />
      {I18n.t('apps.hardware.field.add_new')}
    </button>
  );
};

CreateField.propTypes = {
  updateFieldList: PropTypes.func.isRequired,
  toggleExpand: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};

export default CreateField;
