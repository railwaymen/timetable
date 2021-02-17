import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makePostRequest } from '../../shared/api';
import TypesSelect from './types_select';
import Errors from './errors';
import translateErrors from '../../shared/translate_errors';
import useFormHandler from '../../../hooks/use_form_handler';

const CreateHardware = ({ updateHardwareList, selectedUser }) => {
  const [hardware, setHardware, onChange] = useFormHandler({
    type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
  });
  const [errors, setErrors] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();
    const hardwareWithId = { ...hardware, user_id: selectedUser.id };
    makePostRequest({ url: '/api/hardwares', body: { hardware: hardwareWithId } }).then((response) => {
      updateHardwareList(response.data);
      setHardware({
        type: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        physical_condition: '',
        functional_condition: '',
      });
      setErrors({});
    }).catch((response) => {
      const translatedErrors = translateErrors('hardware', response.errors);
      setErrors(translatedErrors);
    });
  };

  return (
    <div className="card">
      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="form-group col-md-3">
            <label htmlFor="type">
              {I18n.t('apps.hardware.type')}
            </label>
            <TypesSelect
              selected={hardware.type}
              changeType={onChange}
            />
            {errors.type && <Errors errors={errors.type} />}
          </div>
          <div className="form-group col-md-3">
            <label htmlFor="manufacturer">
              {I18n.t('apps.hardware.manufacturer')}
            </label>
            <input
              type="text"
              name="manufacturer"
              className="form-control"
              value={hardware.manufacturer}
              onChange={onChange}
            />
            {errors.manufacturer && <Errors errors={errors.manufacturer} />}
          </div>
          <div className="form-group col-md-3">
            <label htmlFor="model">
              {I18n.t('apps.hardware.model')}
            </label>
            <input
              type="text"
              name="model"
              className="form-control"
              value={hardware.model}
              onChange={onChange}
            />
            {errors.model && <Errors errors={errors.model} />}
          </div>
          <div className="form-group col-md-3">
            <label htmlFor="serial_number">
              {I18n.t('apps.hardware.serial_number')}
            </label>
            <input
              type="text"
              name="serial_number"
              className="form-control"
              value={hardware.serial_number}
              onChange={onChange}
            />
            {errors.serialNumber && <Errors errors={errors.serialNumber} />}
          </div>
        </div>
        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="physical_condition">
              {I18n.t('apps.hardware.physical_condition')}
            </label>
            <textarea
              type="text"
              name="physical_condition"
              className="form-control"
              value={hardware.physical_condition}
              onChange={onChange}
            />
            {errors.physicalCondition && <Errors errors={errors.physicalCondition} />}
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="functional_condition">
              {I18n.t('apps.hardware.functional_condition')}
            </label>
            <textarea
              type="text"
              name="functional_condition"
              className="form-control"
              value={hardware.functional_condition}
              onChange={onChange}
            />
            {errors.functionalCondition && <Errors errors={errors.functionalCondition} />}
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-lg btn-success"
          >
            <i className="fa fa-save mr-3" />
            {I18n.t('common.save')}
          </button>
        </div>
      </form>

    </div>
  );
};

CreateHardware.propTypes = {
  updateHardwareList: PropTypes.func.isRequired,
  selectedUser: PropTypes.object.isRequired,
};
export default CreateHardware;
