import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import FieldsList from './fields/fields_list';
import EditHardware from './edit_hardware';
import AccessoryList from './accessories/accessory_list';
import { makePutRequest } from '../../shared/api';
import translateErrors from '../../shared/translate_errors';
import Errors from './errors';
import Warnings from './warnings';

const Hardware = ({
  hardware, onDelete, fields, selectHardware, selected, onStatusChange, users,
}) => {
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState({});
  const [stateHardware, setStateHardware] = useState(hardware);
  const [changeStatus, setChangeStatus] = useState(false);
  const [hardwareExpanded, setHardwareExpanded] = useState(false);

  useEffect(() => {
    setStateHardware(hardware);
  }, [hardware]);

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

  function updateHardware(updatedHardware, agreement = false) {
    makePutRequest({
      url: `/api/hardwares/${stateHardware.id}`,
      body: { hardware: { ...updatedHardware } },
    }).then((response) => {
      const newHardware = response.data;
      setStateHardware({ ...stateHardware, ...newHardware });
      if (agreement) { onStatusChange(newHardware); }
    });
  }

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

  function HardwareManagement() {
    if (!currentUser.isHardwareManager() && _.includes(['loaned', 'returning'], stateHardware.status)) { return null; }
    return (
      <>
        <button
          type="button"
          onClick={() => onEdit()}
          data-tooltip-bottom={I18n.t('common.edit')}
          className="btn btn-outline-primary"
        >
          <i className="fa fa-pencil" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(stateHardware.id)}
          data-tooltip-bottom={I18n.t('common.destroy')}
          className="btn btn-outline-danger"
        >
          <i className="fa fa-trash" />
        </button>
      </>
    );
  }

  const lockManagement = () => {
    if (currentUser.isHardwareManager()) {
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

  function SelectManagment() {
    const iconClass = selected ? 'fa fa-check' : 'fa fa-square-full';

    return (
      <button
        type="button"
        data-tooltip-bottom="select"
        className="btn btn-outline-secondary"
        style={{ width: '36px' }}
        onClick={() => selectHardware(stateHardware.id, stateHardware.status)}
      >
        <i className={iconClass} />
      </button>
    );
  }

  function LoaningManagement() {
    return (
      <button
        type="button"
        data-tooltip-bottom={I18n.t(`apps.hardware.accept_${stateHardware.status}`)}
        className="btn btn-outline-success"
        onClick={() => updateHardware({ status: (stateHardware.status === 'loaning' ? 'loaned' : 'in_office') }, true)}
      >
        <i className="fa fa-check-square" />
      </button>
    );
  }

  function UndoAction() {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => updateHardware({ status: (stateHardware.status === 'loaning' ? 'in_office' : 'loaned') }, true)}
      >
        {I18n.t('apps.hardware.undo')}
      </button>
    );
  }

  const hardwareActions = () => {
    if (!currentUser.isHardwareManager() && stateHardware.locked) {
      return null;
    }
    if (!currentUser.isHardwareManager() && _.includes(['loaning', 'returning'], stateHardware.status)) {
      return <UndoAction />;
    }

    return (
      <div className="col-auto">
        <div className="btn-group bg-white">
          <HardwareManagement />
          {lockManagement()}
          {_.includes(['loaning', 'returning'], stateHardware.status) && <LoaningManagement />}
          <SelectManagment />
        </div>
      </div>
    );
  };

  function LockedError() {
    if ((stateHardware.status === 'in_office' && !stateHardware.locked) || currentUser.isHardwareManager()) { return null; }

    if (stateHardware.locked) {
      return (
        <div>
          <Errors errors={[I18n.t('apps.hardware.locked')]} />
          <hr />
        </div>
      );
    }

    return (
      <div>
        <Warnings warnings={[I18n.t(`apps.hardware.${stateHardware.status}`)]} status={stateHardware.status} />
        <hr />
      </div>
    );
  }

  function onSelectStatusChange(e) {
    if (_.includes(e.target.classList, 'option')) {
      makePutRequest({
        url: `/api/hardwares/${stateHardware.id}/change_status`,
        body: { hardware: { status: e.target.dataset.status } },
      }).then((response) => {
        onStatusChange(response.data);
        setChangeStatus(false);
      });
    }
  }

  function InteractiveStatus() {
    if (changeStatus) {
      const statuses = I18n.t('apps.hardware.statuses');
      const options = Object.keys(statuses).map((status) => (
        <div
          key={`${stateHardware.id}-${status}`}
          name="option"
          className={`option px-3${(status === stateHardware.status ? ' selected' : '')}`}
          data-status={status}
        >
          {statuses[status]}
        </div>
      ));
      return (
        <div
          className="fit-content m-auto text-center form-control h-100 status-select"
          onClick={onSelectStatusChange}
        >
          {options}
        </div>
      );
    }

    return <Status className=" pointer-cursor" props={{ onClick: () => setChangeStatus(true) }} />;
  }

  function Status({ className = '', props = {} }) {
    return (
      <div className={`text-center font-weight-bold ${stateHardware.status}${className}`} {...props}>
        {I18n.t(`apps.hardware.statuses.${stateHardware.status}`)}
      </div>
    );
  }

  function MoreInformations() {
    if (hardwareExpanded) {
      return (
        <>
          <FieldsList locked={stateHardware.locked} hardware_id={stateHardware.id} fields={fields} status={stateHardware.status} />
          <AccessoryList hardware={stateHardware} />
          <div className=" d-flex justify-content-end">
            <button
              onClick={() => setHardwareExpanded(false)}
              type="button"
              data-tooltip-bottom={I18n.t('common.fold')}
              className="btn btn-outline-primary rounded-circle"
            >
              <i className="fa fa-arrow-up" />
            </button>
          </div>
        </>
      );
    }

    return (
      <div className=" d-flex justify-content-end">
        <button
          onClick={() => setHardwareExpanded(true)}
          type="button"
          data-tooltip-bottom={I18n.t('common.expand')}
          className="btn btn-outline-primary rounded-circle"
        >
          <i className="fa fa-arrow-down" />
        </button>
      </div>
    );
  }

  if (edit) {
    return (
      <EditHardware
        onEdit={onEdit}
        errors={errors}
        onSave={onSave}
        users={users}
        hardware={stateHardware}
      />
    );
  }

  return (
    <div className="col-md-6">
      <div className={`card p-0 ${stateHardware.status}`}>
        <div className="card-header">
          <nav className="row align-items-start mb-3">
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
        </div>
        <div className="card-body container">
          <LockedError />
          <div className="row">
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('apps.hardware.type')}</h6>
              <p>{I18n.t(`apps.hardware.types.${stateHardware.type}`)}</p>
            </div>
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('apps.hardware.serial_number')}</h6>
              <p>{stateHardware.serial_number}</p>
            </div>
            {currentUser.isHardwareManager()
            && (
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('common.user')}</h6>
              <p>
                {stateHardware.user_name}
              </p>
            </div>
            )}
          </div>
          <div className="row">
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('apps.hardware.physical_condition')}</h6>
              <p className="ws-bs">{stateHardware.physical_condition}</p>
            </div>
            <div className="col">
              <h6 className="font-weight-bold">{I18n.t('apps.hardware.functional_condition')}</h6>
              <p className="ws-bs">{stateHardware.functional_condition}</p>
            </div>
          </div>
          <hr className="mb-2" />
          { currentUser.isHardwareManager() ? (<InteractiveStatus />) : (<Status />) }
          <hr className="mt-2" />
          <MoreInformations />
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
  selectHardware: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
};
