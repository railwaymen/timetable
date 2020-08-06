import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { makeGetRequest, makeDeleteRequest } from '../../shared/api';
import Hardware from './hardware';
import CreateHardware from './create_hardware';
import Dropdown from '../../shared/dropdown';

const HardwareList = () => {
  const [hardwareList, setHardwareList] = useState([]);
  const [users, setUsers] = useState([]);
  const emptyUser = {
    first_name: I18n.t('apps.staff.user'), last_name: I18n.t('apps.staff.choose'), id: 0, active: true,
  };
  const [selectedUser, setSelectedUser] = useState(emptyUser);

  useEffect(() => {
    if (currentUser.isHardwareManager()) {
      fetch('/api/users?filter=active&staff')
        .then((response) => response.json())
        .then((data) => {
          data.unshift(emptyUser);
          setUsers(data);
        });
    }
  }, []);

  useEffect(() => {
    const url = selectedUser.id === 0 ? '/api/hardwares' : `/api/hardwares?user_id=${selectedUser.id}`;
    makeGetRequest({ url }).then((response) => {
      setHardwareList(response.data);
    });
  }, [selectedUser]);

  const updateHardwareList = (hardware) => {
    setHardwareList([...hardwareList, hardware]);
  };

  const onDelete = (id) => {
    makeDeleteRequest({ url: `/api/hardwares/${id}` }).then(() => {
      setHardwareList(hardwareList.filter((el) => el.id !== id));
    });
  };

  function FilterUsers(filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(users, (u) => (
      u.active && (`${u.first_name} ${u.last_name}`.toLowerCase().match(lowerFilter) || `${u.last_name} ${u.first_name}`.toLowerCase().match(lowerFilter))
    ));
  }

  function RenderSelectedUser(currentlySelectedUser) {
    return (
      <div>
        <b>
          {`${currentlySelectedUser.last_name} ${currentlySelectedUser.first_name}`}
        </b>
      </div>
    );
  }

  function RenderUsersList(user, currentlySelectedUser) {
    return (
      <div>
        {user.id === currentlySelectedUser.id ? (
          <b>
            {`${user.last_name} ${user.first_name}`}
          </b>
        ) : `${user.last_name} ${user.first_name}`}
      </div>
    );
  }

  function UserFilter() {
    if (!currentUser.isHardwareManager()) { return null; }

    return (
      <div className="row">
        <div className="col-md-2 mx-auto">
          <div className="mx-auto mb-4 w-80">
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
      </div>
    );
  }

  return (
    <>
      <CreateHardware updateHardwareList={updateHardwareList} />
      <UserFilter />
      <div className="row">
        {hardwareList.map((hardware) => (
          <Hardware
            key={hardware.id}
            user_name={hardware.user_name}
            onDelete={onDelete}
            hardware={hardware}
            fields={hardware.fields || []}
          />
        ))}
      </div>
    </>
  );
};

export default HardwareList;
