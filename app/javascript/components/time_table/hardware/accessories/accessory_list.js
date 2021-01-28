import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Accessory from './accessory';
import AccessoryForm from './accessory_form';
import { makeDeleteRequest } from '../../../shared/api';

function AccessoryList({ hardware }) {
  const [accessoryList, setAccessoryList] = useState(hardware.accessories || []);
  const [newAccessory, setNewAccessory] = useState(false);

  function updateAccessoryList(accessory) {
    setAccessoryList([...accessoryList, accessory]);
    setNewAccessory(false);
  }

  function onDelete(id) {
    makeDeleteRequest({
      url: `/api/hardwares/${hardware.id}/accessories/${id}`,
    }).then(() => {
      setAccessoryList(accessoryList.filter((accessory) => accessory.id !== id));
    });
  }

  function NewAccessory() {
    if ((hardware.locked || hardware.status !== 'in_office') && !currentUser.isHardwareManager()) { return null; }
    if (newAccessory) { return <AccessoryForm hardwareId={hardware.id} foldForm={(a) => setNewAccessory(a)} updateAccessoryList={updateAccessoryList} />; }

    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setNewAccessory(true)}
      >
        <i className="fa fa-plus mr-3" />
        {I18n.t('apps.hardware.add_accessory')}
      </button>
    );
  }

  return (
    <div>
      <div className="mb-3 mt-3">
        <h4 className="font-weight-bold">{I18n.t('apps.hardware.accessories')}</h4>
      </div>

      {accessoryList.map((accessory, index) => (
        <Accessory
          key={accessory.id}
          accessory={accessory}
          hardware={hardware}
          onDelete={onDelete}
          index={index + 1}
        />
      ))}

      <NewAccessory />
    </div>
  );
}

export default AccessoryList;

AccessoryList.propTypes = {
  hardware: PropTypes.object.isRequired,
};
