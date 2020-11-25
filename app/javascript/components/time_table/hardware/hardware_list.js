import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import * as Api from '../../shared/api';
import Hardware from './hardware';
import CreateHardware from './create_hardware';
import Dropdown from '../../shared/dropdown';
import ModalButton from '../../shared/modal_button';
import Modal from '../../shared/modal';
import Errors from './errors';
import Warnings from './warnings';

const HardwareList = () => {
  const [hardwareList, setHardwareList] = useState([]);
  const [users, setUsers] = useState([]);
  const withoutUser = {
    accounting_name: I18n.t('apps.hardware.no_user'), id: '', active: true,
  };
  const [selectedUser, setSelectedUser] = useState(currentUser);
  const [selectedHardwares, setSelectedHardwares] = useState([]);
  const [modalContext, setModalContext] = useState(undefined);
  const [companyInfo, setCompanyInfo] = useState({ company: 'railwaymen', companyPerson: 'lukasz' });
  const [errors, setErrors] = useState([]);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const selectedHardwaresIds = selectedHardwares.map((h) => h.id);
  const selectedStatuses = [...new Set(selectedHardwares.map((h) => h.status))];

  useEffect(() => {
    if (currentUser.isHardwareManager()) {
      fetch('/api/users?filter=active&staff')
        .then((response) => response.json())
        .then((data) => {
          data.unshift(withoutUser);
          setUsers(data);
        });
    }
  }, []);

  function getHardwares() {
    let url = selectedUser.id === 0 ? '/api/hardwares' : `/api/hardwares?user_id=${selectedUser.id}`;
    if (statusFilter) { url += `${selectedUser.id === 0 ? '?' : '&'}status=${statusFilter}`; }
    Api.makeGetRequest({ url }).then((response) => {
      setHardwareList(response.data);
    });
  }

  useEffect(() => {
    getHardwares();
    setSelectedHardwares([]);
  }, [selectedUser, statusFilter]);

  useEffect(() => {
    setErrors([]);
  }, [selectedHardwares, hardwareList]);

  const updateHardwareList = (hardware) => {
    setHardwareList([...hardwareList, hardware]);
  };

  const onDelete = (id) => {
    Api.makeDeleteRequest({ url: `/api/hardwares/${id}` }).then(() => {
      setHardwareList(hardwareList.filter((el) => el.id !== id));
    });
  };

  function onDeleteSelected() {
    let ids = selectedHardwaresIds;
    if (!currentUser.isHardwareManager()) { ids = selectedHardwares.filter((sh) => sh.status === 'in_office').map((sh) => sh.id); }
    Api.makeDeleteRequest({ url: `/api/hardwares_bulk_destroy?selected_hardwares=${ids}` })
      .then(() => {
        setHardwareList(hardwareList.filter((h) => !_.includes(ids, h.id)));
        setSelectedHardwares(selectedHardwares.filter((sh) => !_.includes(ids, sh.id)));
      });
  }

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

  function UserFilter() {
    return (
      <div className="col-md-2">
        <div className="mx-auto w-80">
          <Dropdown
            objects={users}
            updateObject={(currentlySelectedUser) => setSelectedUser(currentlySelectedUser)}
            selectedObject={selectedUser}
            filterObjects={FilterUsers}
            renderSelectedObject={RenderSelectedUser}
            renderObjectsList={RenderUsersList}
          />
        </div>
      </div>
    );
  }

  function selectHardware(id, status) {
    if (_.includes(selectedHardwaresIds, id)) {
      setSelectedHardwares(selectedHardwares.filter((h) => h.id !== id));
    } else {
      setSelectedHardwares(selectedHardwares.concat({ id, status }));
    }
  }

  function sendMailToAccountancy(hardwareIds) {
    let url = `/api/hardwares/${modalContext}_agreement`;
    url += `?ids=${hardwareIds}`;
    url += `&company=${companyInfo.company}`;
    url += `&lender=${companyInfo.companyPerson}`;
    Api.makeGetRequest({url})
      .then((response) => {
        console.log('siema eniu')
      })
  }

  function bulkUpdate(hardware, ids = selectedHardwaresIds, agreement = false) {
    Api.makePutRequest({
      url: '/api/hardwares_bulk_update', body: { selected_hardwares: ids, hardware },
    }).then((response) => {
      setHardwareList(hardwareList.map((h) => (_.includes(response.data.ids, h.id) ? ({ ...h, ...hardware }) : h)));
      if (agreement) {
        // $('a.generate-agreement-link')[0].click();
        sendMailToAccountancy(ids);
        setSelectedHardwares([]);
      }
    }).catch((response) => {
      setErrors(response.errors);
    });
  }

  function ActionButtons() {
    return (
      <div className="btn-group bg-white">
        <ModalButton
          id="hardware-agreements-modal"
          btnClass="btn btn-outline-danger"
          content={<i className="fa fa-trash" />}
          onClick={() => setModalContext('delete')}
          props={{ disabled: !_.includes(selectedStatuses, 'in_office'), 'data-tooltip-bottom': I18n.t('common.destroy_selected') }}
        />
        { currentUser.isHardwareManager()
          && (
          <>
            <button
              type="button"
              onClick={() => bulkUpdate({ locked: true })}
              data-tooltip-bottom={I18n.t('common.lock_selected')}
              className="btn btn-warning"
            >
              <i className="fa fa-lock" />
            </button>
            <button
              type="button"
              onClick={() => bulkUpdate({ locked: false })}
              data-tooltip-bottom={I18n.t('common.unlock_selected')}
              className="btn btn-info"
            >
              <i className="fa fa-unlock" />
            </button>
          </>
          )}
      </div>
    );
  }

  function onSelectAllClick() {
    if (currentUser.isHardwareManager()) {
      setSelectedHardwares(hardwareList.map((h) => ({ id: h.id, status: h.status })));
    } else {
      setSelectedHardwares(hardwareList.map((h) => (_.includes(['in_office', 'loaned'], h.status) ? ({ id: h.id, status: h.status }) : null)).filter(Boolean));
    }
  }

  function SelectManagement() {
    return (
      <div className="btn-group bg-white">
        <button
          type="button"
          data-tooltip-bottom={I18n.t('common.select_all')}
          className="btn btn-outline-secondary"
          style={{ width: '36px' }}
          onClick={onSelectAllClick}
        >
          <i className="fa fa-check" />
        </button>
        <button
          type="button"
          data-tooltip-bottom={I18n.t('common.unselect_all')}
          className="btn btn-outline-secondary"
          style={{ width: '36px', marginRight: '10px' }}
          onClick={() => setSelectedHardwares([])}
        >
          <i className="fa fa-square-full" />
        </button>
      </div>
    );
  }

  function Agreements() {
    return (
      <div className="btn-group bg-white ml-5">
        <ModalButton
          id="hardware-agreements-modal"
          btnClass="btn btn-outline-secondary"
          content={I18n.t('apps.hardware.hardware_rental')}
          onClick={() => setModalContext('rental')}
          props={{ disabled: !currentUser.isHardwareManager() && !_.includes(selectedStatuses, 'in_office') }}
        />
        <ModalButton
          id="hardware-agreements-modal"
          btnClass="btn btn-outline-secondary"
          content={I18n.t('apps.hardware.hardware_return')}
          onClick={() => setModalContext('return')}
          props={{ disabled: !currentUser.isHardwareManager() && !_.includes(selectedStatuses, 'loaned') }}
        />
      </div>
    );
  }

  function Actions() {
    return (
      <div className="col-md-5">
        <div className="col-auto">
          {hardwareList.length > 0 && <SelectManagement />}
          {selectedHardwares.length > 0
            && (
            <>
              <ActionButtons />
              <Agreements />
            </>
            )}
        </div>
      </div>
    );
  }

  function ModalHeader() {
    if (modalContext === 'rental') {
      return 'Hardware Rental';
    } if (modalContext === 'return') {
      return 'Hardware Return';
    }

    return 'Hardware Delete';
  }

  function DeleteModalWarning() {
    if (currentUser.isHardwareManager()) {
      return (
        <Warnings warnings={[I18n.t('apps.hardware.admin.skip_not_in_office')]} />
      );
    }

    return (
      <Warnings warnings={[I18n.t('apps.hardware.skip_not_in_office')]} />
    );
  }

  function DeleteModal() {
    return (
      <div>
        { selectedStatuses.length !== 1 && <DeleteModalWarning /> }
        {I18n.t('apps.hardware.confirm_delete', { count: selectedHardwares.length })}
      </div>
    );
  }

  function ModalContent() {
    if (modalContext === 'delete') { return <DeleteModal />; }
    return (
      <form className="form ui">
        { selectedStatuses.length !== 1
          && <Warnings warnings={[I18n.t(`apps.hardware.skip_${modalContext === 'rental' ? 'loaned' : 'returned'}`)]} />}
        <div className="fields inline">
          <div className="field">
            <label>{I18n.t('apps.hardware.company')}</label>
            <select
              onChange={(e) => setCompanyInfo({ ...companyInfo, company: e.target.value })}
              value={companyInfo.company}
              className="dropdown ui"
              id="company"
              type="text"
              name="company"
            >
              <option value="railwaymen">Railwaymen</option>
              <option value="rwm">RWM</option>
              <option value="postbistro">PostBistro</option>
            </select>
          </div>
          <div className="field">
            <label>{I18n.t('apps.hardware.lender')}</label>
            <select
              onChange={(e) => setCompanyInfo({ ...companyInfo, companyPerson: e.target.value })}
              value={companyInfo.companyPerson}
              className="dropdown ui"
              id="company"
              type="text"
              name="company"
            >
              <option value="lukasz">Łukasz Młynek</option>
              <option value="grzegorz">Grzegorz Forysiński/</option>
              <option value="marcin">Marcin Czesak</option>
            </select>
          </div>
        </div>
      </form>
    );
  }

  function DeleteModalActions() {
    return (
      <button
        type="button"
        onClick={onDeleteSelected}
        className="btn btn-danger"
        data-dismiss="modal"
      >
        {I18n.t('common.destroy_selected')}
      </button>
    );
  }

  function ModalActions() {
    if (modalContext === 'delete') { return <DeleteModalActions />; }

    const ids = selectedHardwares.filter((sh) => sh.status === (modalContext === 'rental' ? 'in_office' : 'loaned')).map((sh) => sh.id);
    return (
      <>
        <div
          className="btn btn-outline-success"
          onClick={() => bulkUpdate({ status: (modalContext === 'rental' ? 'loaning' : 'returning') }, ids, true)}
          data-dismiss="modal"
        >
          {I18n.t('common.generate')}
        </div>
        <a className="d-none generate-agreement-link" href={'url'} />
      </>
    );
  }

  function onStatusChange(hardware) {
    if (_.includes(selectedHardwaresIds, hardware.id)) {
      setSelectedHardwares(selectedHardwares.map((sh) => (sh.id === hardware.id ? { id: sh.id, status: hardware.status } : sh)));
    }
    setHardwareList(hardwareList.map((h) => (h.id === hardware.id ? { ...h, ...hardware } : h)));
  }

  function onStatusFilterClick(e) {
    if (e.target.dataset.status === statusFilter) { return setStatusFilter(undefined); }
    return setStatusFilter(e.target.dataset.status);
  }

  function Filters() {
    return (
      <div className="col-md-5">
        <div className="btn-group bg-white ml-5">
          <button
            type="button"
            className={`btn btn-outline-secondary ${statusFilter === 'in_office' ? 'active' : ''}`}
            data-status="in_office"
            onClick={onStatusFilterClick}
          >
            {I18n.t('apps.hardware.statuses.in_office')}
          </button>
          <button
            type="button"
            className={`btn btn-outline-secondary ${statusFilter === 'loaning' ? 'active' : ''}`}
            data-status="loaning"
            onClick={onStatusFilterClick}
          >
            {I18n.t('apps.hardware.statuses.loaning')}
          </button>
          <button
            type="button"
            className={`btn btn-outline-secondary ${statusFilter === 'loaned' ? 'active' : ''}`}
            data-status="loaned"
            onClick={onStatusFilterClick}
          >
            {I18n.t('apps.hardware.statuses.loaned')}
          </button>
          <button
            type="button"
            className={`btn btn-outline-secondary ${statusFilter === 'returning' ? 'active' : ''}`}
            data-status="returning"
            onClick={onStatusFilterClick}
          >
            {I18n.t('apps.hardware.statuses.returning')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateHardware updateHardwareList={updateHardwareList} selectedUser={selectedUser} />
      <div className="mx-auto mb-3 text-center fit-content">
        {errors.length > 0 && <Errors errors={errors} />}
      </div>
      <div className="row mb-4">
        {currentUser.isHardwareManager() && <UserFilter />}
        <Actions />
        <Filters />
      </div>
      <div className="row">
        {hardwareList.map((hardware) => (
          <Hardware
            key={hardware.id}
            onDelete={onDelete}
            hardware={hardware}
            fields={hardware.fields || []}
            selectHardware={selectHardware}
            selected={_.includes(selectedHardwaresIds, hardware.id)}
            onStatusChange={onStatusChange}
            users={users}
          />
        ))}
      </div>
      <Modal id="hardware-agreements-modal" header={<ModalHeader />} content={<ModalContent />} actions={<ModalActions />} />
    </>
  );
};

export default HardwareList;
