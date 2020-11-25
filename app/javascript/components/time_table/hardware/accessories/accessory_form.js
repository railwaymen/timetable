import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useFormHandler from '@hooks/use_form_handler';
import { makePostRequest, makePutRequest } from '../../../shared/api';
import Errors from '../errors';
import translateErrors from '../../../shared/translate_errors';

function AccessoryForm({
  hardwareId, accessory = { id: null, name: '' }, foldForm, updateAccessoryList,
}) {
  const [stateAccessory, setStateAccessory, onChange] = useFormHandler(accessory);
  const [errors, setErrors] = useState({});

  function updateAccessory() {
    makePutRequest({
      url: `/api/hardwares/${hardwareId}/accessories/${stateAccessory.id}`,
      body: { accessory: { name: stateAccessory.name } },
    }).then(() => {
      setErrors({});
      foldForm(stateAccessory);
    }).catch((response) => {
      const translatedErrors = translateErrors('hardware_accessory', response.errors);
      setErrors(translatedErrors);
    });
  }

  function createAccessory() {
    makePostRequest({
      url: `/api/hardwares/${hardwareId}/accessories`,
      body: { accessory: { name: stateAccessory.name } },
    }).then((response) => {
      updateAccessoryList(response.data);
      setErrors({});
      setStateAccessory({ name: '' });
    }).catch((response) => {
      const translatedErrors = translateErrors('hardware_accessory', response.errors);
      setErrors(translatedErrors);
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (stateAccessory.id) { return updateAccessory(); }
    return createAccessory();
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="font-weight-bold" htmlFor="name">
            {I18n.t('common.name')}
          </label>
          <input
            type="text"
            name="name"
            className="form-control"
            onChange={onChange}
            value={stateAccessory.name}
          />
          {errors.name && <Errors errors={errors.name} />}
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
            onClick={() => foldForm(false)}
          >
            <i className="fa fa-close mr-3" />
            {I18n.t('common.cancel')}
          </button>
        </div>
      </form>
      <hr />
    </div>
  );
}

export default AccessoryForm;

AccessoryForm.propTypes = {
  hardwareId: PropTypes.number.isRequired,
  accessory: PropTypes.object,
  foldForm: PropTypes.func.isRequired,
  updateAccessoryList: PropTypes.func,
};
