import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import HardwareDeviceAttributeModel from '../../../models/hardware-device-attribute-model';
import HardwareDeviceModel from '../../../models/hardware-device-model';
import { makeDeleteRequest, makeGetRequest } from '../../shared/api';
import Accessories from './hardware-item/accessories';
import Container from './hardware-item/container';
import Images from './hardware-item/images';
import ConfirmModal from './hardware-item/confirm-modal';
import ContentValue from './hardware-item/content-value';
import Modal from './hardware-item/modal';
import Breadcrumb from './shared/breadcrumb';

export default function HardwareItem() {
  const [hardwareDevice, setHardwareDevice] = useState({});
  const [hardwareDeviceAccessories, setHardwareDeviceAccessories] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovedModal, setIsRemovedModal] = useState(false);
  const [isLogModal, setIsLogModal] = useState(false);
  const [deviceHistory, setDeviceHistory] = useState({ list: [], loaded: false });

  const history = useHistory();

  const { id } = useParams();

  useEffect(() => {
    makeGetRequest({
      url: `/api/hardware_devices/${id}`,
    }).then(({ data }) => {
      setHardwareDevice(new HardwareDeviceModel(data));
      setIsLoading(false);
    });

    makeGetRequest({
      url: `/api/hardware_devices/${id}/hardware_device_accessories`,
    }).then(({ data }) => {
      const attributes = data.map((element) => new HardwareDeviceAttributeModel(element));

      setHardwareDeviceAccessories(attributes);
    });

    makeGetRequest({
      url: '/api/users',
    }).then(({ data }) => {
      setUsers(data);
    });
  }, []);

  const onToggleRemoveProcess = () => {
    setIsRemovedModal((state) => !state);
  };

  const onToggleLogs = () => {
    const { loaded } = history;

    if (!loaded) {
      makeGetRequest({
        url: `/api/hardware_devices/${id}/history`,
      }).then(({ data }) => {
        setDeviceHistory({ list: data, loaded: true });
      });
    }

    setIsLogModal((state) => !state);
  };

  const onRemove = () => {
    makeDeleteRequest({
      url: `/api/hardware_devices/${id}`,
    }).then(() => {
      history.push('/hardware-devices');
    });
  };

  if (isLoading) {
    return (
      <div>
        {I18n.t('apps.hardware_devices.loading')}
        ...
      </div>
    );
  }

  const {
    id: hardwareDeviceId,
    state,
    images = [],
    user_id,
    name,
    note,
    category,
    archived,
  } = hardwareDevice;
  const { list: historyList } = deviceHistory;

  const user = users.find((u) => u.id === user_id);

  return (
    <div className="hardware-content">
      <Breadcrumb items={[{ name, path: `/hardware-devices/${id}/show` }]} />
      <ConfirmModal
        visible={isRemovedModal}
        onCancel={onToggleRemoveProcess}
        onConfirm={onRemove}
        confirmTitle={archived ? I18n.t('apps.hardware_devices.remove') : I18n.t('apps.hardware_devices.archive')}
        title={I18n.t('apps.hardware_devices.remove_title')}
      >
        <p>{I18n.t('apps.hardware_devices.remove_body')}</p>
      </ConfirmModal>
      <Modal visible={isLogModal} onClose={onToggleLogs}>
        <LogHistory list={historyList} />
      </Modal>
      <h3>{hardwareDeviceId ? I18n.t('apps.hardware_devices.edit_device') : I18n.t('apps.hardware_devices.add_new_device')}</h3>
      <div className="item-content">
        <Container>
          <h5>
            {I18n.t('apps.hardware_devices.item_info')}
            :
          </h5>
          <ContentsList
            items={[
              'category',
              'device_type',
              'brand',
              'model',
              'serial_number',
            ]}
            object={hardwareDevice}
          />
          {category === 'computers' && (
            <ContentsList
              items={[
                'cpu',
                'ram',
                'storage',
              ]}
              object={hardwareDevice}
            />
          )}
          {['mobile_phones', 'tablets'].includes(category) && (
            <ContentsList
              items={[
                'os_system',
              ]}
              object={hardwareDevice}
            />
          )}
          <h5>
            {I18n.t('apps.hardware_devices.dates')}
            :
          </h5>
          <ContentsList
            items={[
              'year_of_production',
              'year_bought',
              'used_since',
            ]}
            object={hardwareDevice}
          />
          <h5>
            {I18n.t('apps.hardware_devices.accessories')}
            :
          </h5>
          <Accessories
            list={hardwareDeviceAccessories}
            onChangeList={setHardwareDeviceAccessories}
            editable={false}
          />
          <h5>
            {I18n.t('apps.hardware_devices.note')}
            :
          </h5>
          <div className="input-wrapper">
            <p>{note}</p>
          </div>
        </Container>
        <Container>
          <div className="item-actions">
            <button type="button" onClick={onToggleLogs} className="transparent-button space-md">{I18n.t('apps.hardware_devices.log_history')}</button>
            <Link to={`/hardware-devices/${id}/edit`} className="transparent-button edit space-md">
              <i className="symbol fa fa-pencil" />
              {I18n.t('apps.hardware_devices.edit')}
            </Link>
            <button type="button" className="transparent-button destroy space-md" onClick={onToggleRemoveProcess}>
              <i className="symbol fa fa-trash" />
              {I18n.t('apps.hardware_devices.delete')}
            </button>
          </div>
          <ContentValue
            classNameElement="space-md"
            placeholder={I18n.t('apps.hardware_devices.assigned_user')}
            value={user?.full_name}
          />
          <ContentValue
            classNameElement="space-md"
            placeholder={I18n.t('apps.hardware_devices.status')}
            value={state}
          />
          <h5>
            {I18n.t('apps.hardware_devices.photos')}
            :
          </h5>
          <Images
            list={images}
            editable={false}
          />
        </Container>
      </div>
    </div>
  );
}

const ContentsList = ({ items, object }) => (
  <>
    {items.map((item) => (
      <ContentValue value={object[item]} placeholder={I18n.t(`apps.hardware_devices.${item}`)} />
    ))}
  </>
);

function LogHistory({ list }) {
  if (list.length > 1) {
    const keys = Object.keys(list[0].changeset);

    return (
      <div style={{ maxHeight: '100vh', overflowY: 'scroll' }}>
        <table>
          <thead>
            <tr>
              {keys.map((key) => (
                <th>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <HistoryList list={list} keys={keys} />
          </tbody>
        </table>
      </div>
    );
  }

  return <></>;
}

function HistoryList({ list, keys }) {
  return list.map(({ changeset }) => (
    <tr>
      {keys.map((key) => {
        const element = changeset[key];

        if (!element) {
          return <td />;
        }

        return (
          <td>{element[0] ? <b>{element[1]}</b> : element[1]}</td>
        );
      })}
    </tr>
  ));
}
