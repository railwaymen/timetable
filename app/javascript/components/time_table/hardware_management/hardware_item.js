import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
import SelectFilter from './inputs/select-filter';
import isDateValidObject from '../../../helpers/is-date-valid-object';
import translateErrorsSnakeCase from '../../shared/translate_errors_snake_case';

export default function HardwareItem() {
  const [hardwareDevice, setHardwareDevice] = useState(new HardwareDeviceModel({}));
  const [hardwareDeviceAccessories, setHardwareDeviceAccessories] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const { id: paramId } = useParams();
  const history = useHistory();
  const id = Number.isNaN(paramId) ? null : paramId;

  useEffect(() => {
    if (id) {
      makeGetRequest({
        url: `/api/hardware_devices/${id}`,
      }).then(({ data }) => {
        data.year_of_production = new Date(data.year_of_production).getFullYear().toString();
        data.month_bought = (new Date(data.year_bought).getMonth() + 1).toString();
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

  const mapInputsToDates = () => {
    hardwareDevice.year_of_production = new Date(hardwareDevice.year_of_production, 0, 1);
    hardwareDevice.year_bought = new Date(hardwareDevice.year_bought, hardwareDevice.month_bought - 1, 1);
    hardwareDevice.used_since = new Date(hardwareDevice.used_since);
    if (!isDateValidObject(hardwareDevice.used_since)) {
      hardwareDevice.used_since = null;
    }
  };

  const mapDatesToInputs = () => {
    if (isDateValidObject(hardwareDevice.used_since)) {
      [hardwareDevice.used_since] = hardwareDevice.used_since.toISOString().split('T');
    }
    hardwareDevice.year_of_production = hardwareDevice.year_of_production.getFullYear().toString();
    hardwareDevice.year_bought = hardwareDevice.year_bought.getFullYear().toString();
  };

  const onSubmit = async () => {
    mapInputsToDates();

    const form = buildFormData({ device: hardwareDevice, accessories: hardwareDeviceAccessories });

    const validator = new Validator(hardwareDevice);

    validator.validatePresenceOf('brand', 'device_type', 'model', 'serial_number', 'year_of_production', 'year_bought', 'used_since');
    validator.validateIsGreaterOrEqual('used_since', 'year_of_production', 'year_bought');
    validator.validateIsGreaterOrEqual('year_bought', 'year_of_production');

    if (!validator.isValid) {
      mapDatesToInputs();

      return setErrors(validator.errors);
    }

    if (id) {
      return makePutFormdataRequest({
        url: `/api/hardware_devices/${id}`,
        body: form,
      }).then(() => {
        history.push('/hardware-devices');
      }).catch((response) => {
        mapDatesToInputs();

        const translatedErrors = translateErrorsSnakeCase('hardware', response.errors);
        setErrors(translatedErrors);
      });
    }

    return makePostFormdataRequest({
      url: '/api/hardware_devices',
      body: form,
    }).then(() => {
      history.push('/hardware-devices');
    }).catch((response) => {
      mapDatesToInputs();

      const translatedErrors = translateErrorsSnakeCase('hardware', response.errors);
      setErrors(translatedErrors);
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

  const generateYears = () => {
    const startYear = 2000;
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= startYear; i -= 1) {
      years.push(i);
    }

    return years;
  };

  const generateMonths = () => Array(12).fill(0).map((_, i) => i + 1);

  const {
    id: hardwareDeviceId,
    state,
    images = [],
    user_id,
    category,
    note,
    year_of_production,
    year_bought,
    month_bought,
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
            translatable
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
              'device_type',
              'brand',
              'model',
              'price',
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
                'os_version',
              ]}
              onChange={onChange}
              errors={errors.os_version}
              object={hardwareDevice}
            />
          )}
          <h5>
            {I18n.t('apps.hardware_devices.dates')}
            :
          </h5>
          <Select
            onChange={onChange}
            placeholder={I18n.t('apps.hardware_devices.year_of_production')}
            name="year_of_production"
            value={year_of_production}
            options={generateYears()}
            errors={errors.year_of_production}
          />
          <div>
            <Select
              onChange={onChange}
              placeholder={I18n.t('apps.hardware_devices.year_bought')}
              name="year_bought"
              value={year_bought}
              options={generateYears()}
              errors={errors.year_bought}
            />
            <Select
              onChange={onChange}
              placeholder={I18n.t('apps.hardware_devices.month_bought')}
              name="month_bought"
              value={month_bought}
              options={generateMonths()}
              errors={errors.month_bought}
            />
          </div>
          <InputsList
            items={[
              'used_since',
            ]}
            type="date"
            errors={errors}
            onChange={onChange}
            object={hardwareDevice}
          />
          <h5>
            {I18n.t('apps.hardware_devices.invoice')}
          </h5>
          <Input
            onChange={onChange}
            type="text"
            value={hardwareDevice.invoice}
            name="invoice"
            placeholder={I18n.t('apps.hardware_devices.invoice')}
            errors={errors.invoice}
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
            <textarea
              value={note}
              placeholder={I18n.t('apps.hardware_devices.note')}
              name="note"
              onChange={onChange}
              style={{ width: '600px', height: '400' }}
            />
          </div>
        </Container>
        <Container>
          <SelectFilter
            options={[{ id: null, name: I18n.t('apps.hardware_devices.unassigned') }].concat(users)}
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
            placeholder={I18n.t('apps.hardware_devices.state')}
            translatable
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
        key={item}
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
