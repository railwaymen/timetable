import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AccessoryForm from './accessory_form';

function Accessory({
  accessory, hardware, onDelete, index,
}) {
  const [edit, setEdit] = useState(false);
  const [stateAccessory, setStateAccessory] = useState(accessory);

  function foldForm(updateAccessory) {
    if (updateAccessory) { setStateAccessory(updateAccessory); }
    setEdit(false);
  }

  if (edit) {
    return (
      <AccessoryForm accessory={accessory} hardwareId={hardware.id} foldForm={foldForm} />
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-md-8">
          <div className="twelve wide column">
            <label className="font-weight-bold">{I18n.t('apps.hardware.accessory_number', { index })}</label>
            <p>{stateAccessory.name}</p>
          </div>
        </div>
        <div className="col-md-4">
          {((!hardware.locked && hardware.status === 'in_office') || currentUser.isHardwareManager()) && (
          <div className="btn-group">
            <button
              type="button"
              data-tooltip-bottom={I18n.t('common.edit')}
              onClick={() => setEdit(true)}
              className="btn btn-primary"
            >
              <i className="fa fa-pencil" />
            </button>
            <button
              type="button"
              data-tooltip-bottom={I18n.t('common.destroy')}
              onClick={() => onDelete(stateAccessory.id)}
              className="btn btn-danger"
            >
              <i className="fa fa-trash" />
            </button>
          </div>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
}

export default Accessory;

Accessory.propTypes = {
  accessory: PropTypes.object.isRequired,
  hardware: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};
