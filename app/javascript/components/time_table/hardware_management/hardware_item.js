import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HardwareDeviceAttributeModel from '../../../models/hardware-device-attribute-model';
import HardwareDeviceModel from '../../../models/hardware-device-model';
import { makeGetRequest, makePutFormdataRequest, makePostFormdataRequest } from '../../shared/api';
import Accessories from './hardware-item/accessories';
import Container from './hardware-item/container';
import Images from './hardware-item/images';
import StickyMenu from './hardware-item/sticky-menu';
import Input from './inputs/input';
import Select from './inputs/select';
import buildFormData from '../../../helpers/hardware-device/build-form-data';
import Breadcrumb from './shared/breadcrumb';
import Validator from '../../../validators/validator';

export default function HardwareItem() {
  const [hardwareDevice, setHardwareDevice] = useState(new HardwareDeviceModel({}));
  const [hardwareDeviceAccessories, setHardwareDeviceAccessories] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const { id: paramId } = useParams();
  const id = Number.isNaN(paramId) ? null : paramId;

  useEffect(() => {
    if (id) {
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
    } else {
      setIsLoading(false);
    }

    makeGetRequest({
      url: '/api/users',
    }).then(({ data }) => {
      setUsers(data);
    });
  }, []);

  const onChange = ({ target: { value, name } }) => {
    setHardwareDevice((state) => new HardwareDeviceModel({
      ...state,
      [name]: value,
    }));
  };

  const onFilesUpload = (files) => {
    setHardwareDevice((state) => ({
      ...state,
      images: state.images.concat(files),
    }));
  };

  const onSubmit = async () => {
    const form = buildFormData({ device: hardwareDevice, accessories: hardwareDeviceAccessories });

    const validator = new Validator(hardwareDevice);

    validator.validatePresenceOf('brand', 'model', 'serial_number', 'year_of_production', 'year_bought', 'used_since');
    if (!validator.isValid) {
      return setErrors(validator.errors);
    }

    if (id) {
      return makePutFormdataRequest({
        url: `/api/hardware_devices/${id}`,
        body: form,
      }).catch((e) => {
        setErrors(e);
      });
    }

    return makePostFormdataRequest({
      url: '/api/hardware_devices',
      body: form,
    }).catch((e) => {
      setErrors(e);
    });
  };

  const onRemoveImage = (imageId) => {
    setHardwareDevice((state) => {
      const { images } = state;

      const foundImage = images.find((image) => imageId === image.id);

      if (!foundImage) return state;
      if (foundImage.added) {
        return {
          ...state,
          images: images.filter((image) => image.id !== imageId),
        };
      }

      const updatedImages = images.map((image) => {
        if (image.id === imageId) {
          image.removed = true;
          return image;
        }

        return image;
      });

      return {
        ...state,
        images: updatedImages,
      };
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

  const breadcrumbs = () => {
    const { brand, name } = hardwareDevice;

    if (id) {
      return [
        { name, path: `/hardware-devices/${id}/show` },
        { name: `Edit ${brand}`, path: `/hardware-devices/${id}/edit` },
      ];
    }

    return [
      { name: `New ${name}`, path: '#' },
    ];
  };

  const {
    id: hardwareDeviceId,
    state,
    images = [],
    user_id,
    category,
    note,
  } = hardwareDevice;

  return (
    <div className="hardware-content form">
      <Breadcrumb items={breadcrumbs()} />
      <div>
        <h3>{hardwareDeviceId ? I18n.t('apps.hardware_devices.edit_device') : I18n.t('apps.hardware_devices.add_new_device')}</h3>
      </div>
      <div className="item-content">
        <Container>
          <h5>
            {I18n.t('apps.hardware_devices.item_info')}
            :
          </h5>
          <Select
            onChange={onChange}
            placeholder={I18n.t('apps.hardware_devices.category')}
            name="category"
            value={category}
            options={[
              'computers',
              'displays',
              'mobile_phones',
              'tablets',
              'other',
            ]}
            errors={errors.category}
          />
          <InputsList
            items={[
              'type',
              'brand',
              'model',
              'system',
              'serial_number',
            ]}
            onChange={onChange}
            errors={errors}
            object={hardwareDevice}
          />
          {category === 'computers' && (
            <InputsList
              items={[
                'cpu',
                'ram',
                'storage',
              ]}
              onChange={onChange}
              errors={errors.category}
              object={hardwareDevice}
            />
          )}
          {['mobile_phones', 'tablets'].includes(category) && (
            <InputsList
              items={[
                'os_system',
              ]}
              onChange={onChange}
              errors={errors.os_system}
              object={hardwareDevice}
            />
          )}
          <h5>
            {I18n.t('apps.hardware_devices.dates')}
            :
          </h5>
          <InputsList
            items={[
              'year_of_production',
              'year_bought',
              'used_since',
            ]}
            type="date"
            errors={errors}
            onChange={onChange}
            object={hardwareDevice}
          />
          <h5>
            {I18n.t('apps.hardware_devices.accessories')}
            :
          </h5>
          <Accessories
            list={hardwareDeviceAccessories}
            onChangeList={setHardwareDeviceAccessories}
          />
          <h5>
            {I18n.t('apps.hardware_devices.note')}
            :
          </h5>
          <div className="input-wrapper">
            <textarea value={note} placeholder={I18n.t('apps.hardware_devices.note')} name="note" onChange={onChange} />
          </div>
        </Container>
        <Container>
          <Select
            options={[{ id: null, name: 'unassigned' }].concat(users)}
            name="user_id"
            value={user_id}
            onChange={onChange}
            errors={errors.user_id}
            placeholder={I18n.t('apps.hardware_devices.assigned_user')}
          />
          <Select
            options={['poor', 'average', 'good']}
            name="state"
            value={state}
            onChange={onChange}
            errors={errors.status}
            placeholder={I18n.t('apps.hardware_devices.status')}
          />
          <h5>
            {I18n.t('apps.hardware_devices.photos')}
            :
          </h5>
          <Images
            list={images}
            onRemoveImage={onRemoveImage}
            onFilesUpload={onFilesUpload}
          />
        </Container>
      </div>
      <StickyMenu
        onCancel={() => window.history.back()}
        onSubmit={onSubmit}
      />
    </div>
  );
}

const InputsList = ({
  items, object, onChange, type, errors = {},
}) => (
  <>
    {items.map((item) => (
      <Input
        onChange={onChange}
        type={type}
        value={object[item]}
        name={item}
        placeholder={I18n.t(`apps.hardware_devices.${item}`)}
        errors={errors[item]}
      />
    ))}
  </>
);
