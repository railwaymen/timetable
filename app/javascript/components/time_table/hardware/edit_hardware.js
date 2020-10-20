import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Dropdown from '../../shared/dropdown';
import TypesSelect from './types_select';
import Errors from './errors';
import useFormHandler from '../../../hooks/use_form_handler';

const EditHardware = ({
  errors, onEdit, onSave, hardware, users,
}) => {
  const [stateHardware, , onChange] = useFormHandler(hardware);
  const [selectedUser, setSelectedUser] = useState(users.find((u) => u.id === hardware.user_id));

  function FilterUsers(filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(users, (u) => u.accounting_name.toLowerCase().match(lowerFilter));
  }

  function RenderSelectedUser(currentlySelectedUser) {
    return (
      <div>
        <b>
          {currentlySelectedUser.accounting_name}
        </b>
      </div>
    );
  }

  function RenderUsersList(user, currentlySelectedUser) {
    return (
      <div>
        {user.id === currentlySelectedUser.id ? (
          <b>
            {user.accounting_name}
          </b>
        ) : user.accounting_name}
      </div>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    return currentUser.isHardwareManager() ? onSave({ ...stateHardware, user_id: selectedUser.id }) : onSave(stateHardware);
  };
  return (
    <div className="col-md-6">
      <div className="card">
        <div className="container">
          <form onSubmit={onSubmit}>
            {errors.locked && <Errors errors={errors.locked} />}
            <div className="form-group">
              <label>
                {I18n.t('apps.hardware.type')}
              </label>
              <TypesSelect
                changeType={onChange}
                selected={stateHardware.type}
              />
              {errors.type && <Errors errors={errors.type} />}
            </div>
            <hr />
            <div className="form-group">
              <label htmlFor="manufacturer">
                {I18n.t('apps.hardware.manufacturer')}
              </label>
              <input
                name="manufacturer"
                type="text"
                className="form-control"
                onChange={onChange}
                value={stateHardware.manufacturer}
              />
              {errors.manufacturer && <Errors errors={errors.manufacturer} />}
            </div>
            <hr />
            <div className="form-group">
              <label className="font-weight-bold" htmlFor="manufacturer">
                {I18n.t('apps.hardware.model')}
              </label>
              <input
                type="text"
                name="model"
                className="form-control"
                onChange={onChange}
                value={stateHardware.model}
              />
              {errors.model && <Errors errors={errors.model} />}
            </div>
            <hr />
            <div className="ui field">
              <label className="font-weight-bold" htmlFor="serial_number">
                {I18n.t('apps.hardware.serial_number')}
              </label>
              <input
                type="text"
                name="serial_number"
                className="form-control"
                onChange={onChange}
                value={stateHardware.serial_number}
              />
              {errors.serialNumber
              && <Errors errors={errors.serialNumber} />}
            </div>
            {currentUser.isHardwareManager() && (
              <div className="form-group">
                <label className="font-weight-bold">
                  {I18n.t('common.user')}
                </label>
                <Dropdown
                  objects={users}
                  updateObject={(currentlySelectedUser) => setSelectedUser(currentlySelectedUser)}
                  selectedObject={selectedUser}
                  filterObjects={FilterUsers}
                  renderSelectedObject={RenderSelectedUser}
                  renderObjectsList={RenderUsersList}
                />
              </div>
            )}
            <hr />
            <div className="btn-group">
              <button
                type="submit"
                className="btn btn-success"
              >
                <i className="fa fa-check mr-3" />
                {I18n.t('common.save')}
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="btn btn-danger"
              >
                <i className="fa fa-times mr-3" />
                {I18n.t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditHardware.propTypes = {
  errors: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  hardware: PropTypes.object.isRequired,
};

export default EditHardware;
