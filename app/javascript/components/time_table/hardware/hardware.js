import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FieldsList from './fields/fields_list';
import EditHardware from './edit_hardware';
import { makePutRequest } from '../../shared/api';
import translateErrors from '../../shared/translate_errors';
import Errors from './errors';

const Hardware = ({ hardware, onDelete, fields }) => {
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState({});
  const [stateHardware, setStateHardware] = useState(hardware);


  const onSave = (FHardware) => {
    makePutRequest({
      url: `/api/hardwares/${stateHardware.id}`,
      body: { hardware: FHardware },
    }).then((response) => {
      setStateHardware(response.data);
      setEdit(false);
    }).catch((response) => {
      if (response.errors) {
        const translatedErrors = translateErrors('hardware', response.errors);
        setErrors(translatedErrors);
      } else {
        setErrors({ locked: [I18n.t('apps.hardware.locked')] });
      }
    });
  };

  const onEdit = () => {
    setEdit(!edit);
  };

  const onLock = () => {
    makePutRequest({
      url: `/api/hardwares/${stateHardware.id}`,
      body: { hardware: { locked: true } },
    }).then((response) => {
      setStateHardware(response.data);
    });
  };

  const onUnlock = () => {
    makePutRequest({
      url: `/api/hardwares/${stateHardware.id}`,
      body: { hardware: { locked: false } },
    }).then((response) => {
      setStateHardware(response.data);
    });
  };


  const lockManagement = () => {
    if (currentUser.hardware_manager) {
      if (stateHardware.locked) {
        return (
          <button
            type="button"
            onClick={() => onUnlock(stateHardware.id)}
            data-tooltip-bottom={I18n.t('common.unlock')}
            className="btn btn-info"
          >
            <i className="fa fa-lock" />
          </button>
        );
      }
      return (
        <button
          type="button"
          onClick={() => onLock(stateHardware.id)}
          data-tooltip-bottom={I18n.t('common.lock')}
          className="btn btn-warning"
        >
          <i className="fa fa-lock" />
        </button>
      );
    }
    return null;
  };

  const hardwareActions = () => {
    if (hardware.locked && !currentUser.hardware_manager) {
      return null;
    }
    return (
      <div className="col-md-5 btn-group">
        <button
          type="button"
          onClick={() => onEdit()}
          data-tooltip-bottom={I18n.t('common.edit')}
          className="btn btn-primary"
        >
          <i className="fa fa-pencil" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(stateHardware.id)}
          data-tooltip-bottom={I18n.t('common.destroy')}
          className="btn btn-danger"
        >
          <i className="fa fa-trash" />
        </button>
        {lockManagement()}
      </div>
    );
  };

  if (edit) {
    return (
      <EditHardware
        onEdit={onEdit}
        errors={errors}
        onSave={onSave}
        hardware={stateHardware}
      />
    );
  }

  return (
    <div className="col-md-6">
      <div className="card">
        <div className="container">
          {(hardware.locked && !currentUser.hardware_manager)
            && (
            <div>
              <Errors errors={[I18n.t('apps.hardware.locked')]} />
              <hr />
            </div>
            )}
          <nav className="row mb-3">
            <div className="col">
              <h3 className="font-weight-bold">
                {stateHardware.manufacturer}
              </h3>
              <p>
                {stateHardware.model}
              </p>
            </div>
            {hardwareActions()}
          </nav>
          <div className="row">
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('apps.hardware.type')}</h6>
              <p>{I18n.t(`apps.hardware.types.${stateHardware.type}`)}</p>
            </div>
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('apps.hardware.serial_number')}</h6>
              <p>{stateHardware.serial_number}</p>
            </div>
            {currentUser.hardware_manager
            && (
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('common.user')}</h6>
              <p>
                {stateHardware.user_name}
              </p>
            </div>
            )}
          </div>
          <div className="ui divider" />
          <FieldsList hardware_id={stateHardware.id} fields={fields} />
        </div>
      </div>
    </div>
  );
};
export default Hardware;

Hardware.propTypes = {
  onDelete: PropTypes.func.isRequired,
  hardware: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
};
