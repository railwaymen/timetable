import React, { useState, useEffect } from 'react';
import { makeGetRequest, makeDeleteRequest } from '../../shared/api';
import Hardware from './hardware';
import CreateHardware from './create_hardware';

const HardwareList = () => {
  const [hardwareList, setHardwareList] = useState([]);

  useEffect(() => {
    makeGetRequest({ url: '/api/hardwares' }).then((response) => {
      setHardwareList(response.data);
    });
  }, []);

  const updateHardwareList = (hardware) => {
    setHardwareList([...hardwareList, hardware]);
  };

  const onDelete = (id) => {
    makeDeleteRequest({ url: `/api/hardwares/${id}` }).then(() => {
      setHardwareList(hardwareList.filter((el) => el.id !== id));
    });
  };
  return (
    <div className="container">
      <CreateHardware updateHardwareList={updateHardwareList} />
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
    </div>
  );
};

export default HardwareList;
