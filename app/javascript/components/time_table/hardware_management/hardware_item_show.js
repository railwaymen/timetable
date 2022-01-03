import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import Select from './inputs/select';
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
import Button from './shared/button';
import ErrorTooltip from '../../shared/error_tooltip';

export default function HardwareItem() {
  const [hardwareDevice, setHardwareDevice] = useState({});
  const [hardwareDeviceAccessories, setHardwareDeviceAccessories] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovedModal, setIsRemovedModal] = useState(false);
  const [isLogModal, setIsLogModal] = useState(false);
  const [deviceHistory, setDeviceHistory] = useState({ list: [], loaded: false });
  const [isRentalModalVisible, setIsRentalModalVisible] = useState(null);
  const [generateError, setGenerateError] = useState(null);

  const history = useHistory();

  const { id } = useParams();

  useEffect(() => {
    makeGetRequest({
      url: `/api/hardware_devices/${id}`,
    }).then(({ data }) => {
      data.year_of_production = new Date(data.year_of_production).getFullYear().toString();
      data.month_bought = new Date(data.year_bought).getMonth() + 1;
      data.year_bought = new Date(data.year_bought).getFullYear().toString();
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

  const onToggleRentalModalVisible = () => {
    if (!hardwareDevice.user_id) {
      setGenerateError(I18n.t('apps.hardware_devices.error_unassigned_device'));
      return;
    }

    setIsRentalModalVisible((state) => !state);
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
      <Modal style={{ minWidth: '30%' }} visible={isRentalModalVisible} onClose={onToggleRentalModalVisible}>
        <Rental id={id} onSubmit={onToggleRentalModalVisible} />
      </Modal>
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
        <LogHistory users={users} list={historyList} />
      </Modal>
      <h3>{name}</h3>
      <div className="item-content">
        <Container>
          <h5>
            {I18n.t('apps.hardware_devices.item_info')}
            :
          </h5>
          <ContentValue value={I18n.t(`apps.hardware_devices.${category}`)} placeholder={I18n.t('apps.hardware_devices.category')} />
          <ContentsList
            items={[
              'device_type',
              'brand',
              'model',
              'price',
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
                'os_version',
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
              'month_bought',
              'used_since',
            ]}
            object={hardwareDevice}
          />
          <h5>
            {I18n.t('apps.hardware_devices.invoice')}
          </h5>
          <ContentValue
            value={hardwareDevice.invoice}
            placeholder={I18n.t('apps.hardware_devices.invoice')}
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
            <p style={{ width: '600px', height: '400px', whiteSpace: 'pre' }}>{note}</p>
          </div>
        </Container>
        <Container>
          <div className="item-actions">
            <button type="button" onClick={onToggleLogs} className="transparent-button space-md">{I18n.t('apps.hardware_devices.log_history')}</button>
            <Link to={`/hardware-devices/${id}/edit`} className="transparent-button edit space-md">
              <i className="symbol fa fa-pencil" />
              {I18n.t('apps.hardware_devices.edit')}
            </Link>
            {generateError && <ErrorTooltip errors={[generateError]} /> }
            <button type="button" className="transparent-button space-md info" onClick={onToggleRentalModalVisible}>
              {I18n.t('apps.hardware_devices.generate')}
            </button>
            <button type="button" className="transparent-button destroy space-md" onClick={onToggleRemoveProcess}>
              <i className="symbol fa fa-trash" />
              {I18n.t('apps.hardware_devices.delete')}
            </button>
          </div>
          <ContentValue
            classNameElement="space-md"
            placeholder={I18n.t('apps.hardware_devices.assigned_user')}
            value={`${user?.first_name} ${user?.last_name}`}
          />
          <ContentValue
            classNameElement="space-md"
            placeholder={I18n.t('apps.hardware_devices.state')}
            value={I18n.t(`apps.hardware_devices.${state}`)}
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

function Rental({ id, onSubmit }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [typeOfDocument, setTypeOfDocument] = useState('rental');

  const onCompanyChange = ({ target: { value } }) => {
    const foundCompany = companies.find((company) => company.id === parseInt(value, 10));

    setSelectedCompany(foundCompany);
  };

  const onTypeOfDocumentChange = ({ target: { value } }) => setTypeOfDocument(value);

  const onSubmitForm = () => {
    const searchParams = new URLSearchParams({
      type: typeOfDocument,
      company_id: selectedCompany?.id,
    });

    window.open(`/api/hardware_devices/${id}/device_agreement?${searchParams.toString()}`, '_blank').focus();
    onSubmit();
  };

  useEffect(() => {
    makeGetRequest({ url: '/api/companies' })
      .then((response) => {
        setCompanies(response.data);
        setSelectedCompany(response.data[0]);
      });
  }, []);

  return (
    <div className="item-content">
      <div className="content-container">
        <Select
          onChange={onCompanyChange}
          placeholder={I18n.t('apps.hardware.company')}
          name="company"
          innerClassName="end"
          value={selectedCompany?.id}
          translatable
          options={companies}
        />
        <Select
          onChange={onTypeOfDocumentChange}
          placeholder={I18n.t('common.type')}
          name="type"
          optionName="type"
          value={typeOfDocument}
          innerClassName="end"
          translatable
          options={['rental', 'return']}
        />
        <Button onClick={onSubmitForm} type="primary">{I18n.t('apps.hardware_devices.generate')}</Button>
      </div>
    </div>
  );
}

const ContentsList = ({ items, object }) => (
  <>
    {items.map((item) => (
      <ContentValue key={item} value={object[item]} placeholder={I18n.t(`apps.hardware_devices.${item}`)} />
    ))}
  </>
);

function LogHistory({ list, users }) {
  const [, ...modifications] = list;
  return (
    <div style={{ maxHeight: '90vh', overflowY: 'scroll', padding: '30px' }}>
      {modifications.map((modification) => (
        <LogHistoryRecord changeset={modification.changeset} users={users} />
      ))}
    </div>
  );
}

function LogHistoryRecord({ changeset, users }) {
  const { updated_at, user_id, ...attributes } = changeset;

  const dateTime = `${updated_at[1].substring(0, 10)} ${updated_at[1].substring(11, 16)}`;

  if (user_id) {
    const user1 = users.find((user) => user.id === user_id[0]);
    const user2 = users.find((user) => user.id === user_id[1]);
    attributes.assigned_person = [];
    attributes.assigned_person[0] = user1 ? `${user1.first_name} ${user1.last_name}` : null;
    attributes.assigned_person[1] = user2 ? `${user2.first_name} ${user2.last_name}` : null;
  }

  return (
    <>
      <p><b>{dateTime}</b></p>
      <div>
        {Object.keys(attributes).map((attribute) => (
          <p>
            {`${I18n.t(`apps.hardware_devices.${attribute}`)} : `}
            <span style={{ color: '#d11b1b' }}>
              {attributes[attribute][0] ? attributes[attribute][0] : I18n.t('apps.hardware_devices.empty')}
            </span>
            {' => '}
            <span style={{ color: '#34c96b' }}>
              {attributes[attribute][1]}
            </span>
          </p>
        ))}
      </div>
    </>
  );
}
