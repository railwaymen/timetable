import React from 'react';
import HardwareDeviceAttributeModel from '../../../../models/hardware-device-attribute-model';
import Input from '../inputs/input';
import Button from '../shared/button';
import ContentValue from './content-value';

export default function Accessories({ list, onChangeList, editable = true }) {
  const onChange = (id, { target: { name, value } }) => {
    const updatedList = list.map((element) => {
      if (element.uniqueId === id) {
        return {
          ...element,
          [name]: value,
        };
      }

      return element;
    });

    onChangeList(updatedList);
  };

  const onToggleRemove = (id) => {
    const updatedList = list.map((element) => {
      if (element.uniqueId === id) {
        return {
          ...element,
          removed: !element.removed,
        };
      }

      return element;
    });

    onChangeList(updatedList);
  };

  const onAdd = () => {
    onChangeList(list.concat(new HardwareDeviceAttributeModel({ uniqueId: new Date() })));
  };

  return (
    <div className="accessories">
      {editable ? (
        <EditableList
          list={list}
          onChange={onChange}
          onToggleRemove={onToggleRemove}
          onAdd={onAdd}
        />
      ) : (
        <PreviewList list={list} />
      )}
    </div>
  );
}

function PreviewList({ list }) {
  return (
    <>
      {list.map((accessory) => (
        <div className="nested-input-wrapper" key={accessory.uniqueId}>
          <ContentValue
            placeholder={I18n.t('apps.hardware_devices.name')}
            value={accessory.name}
            classNameElement="space-md"
          />
          <ContentValue
            placeholder={I18n.t('apps.hardware_devices.quantity')}
            value={accessory.quantity}
            classNameElement="space-md"
          />
        </div>
      ))}
    </>
  );
}

function EditableList({
  list, onChange, onToggleRemove, onAdd,
}) {
  const onQuantityChange = (uniqueId, e) => {
    const { target: { value } } = e;

    if (value >= 0) {
      onChange(uniqueId, e);
    }
  };

  return (
    <>
      {list.map((accessory) => (
        <div className="nested-input-wrapper" key={accessory.uniqueId}>
          <Input
            disabled={accessory.removed}
            onChange={(e) => onChange(accessory.uniqueId, e)}
            placeholder={I18n.t('apps.hardware_devices.name')}
            name="name"
            value={accessory.name}
            id={`name-${accessory.id}`}
          />
          <Input
            disabled={accessory.removed}
            onChange={(e) => onQuantityChange(accessory.uniqueId, e)}
            placeholder={I18n.t('apps.hardware_devices.quantity')}
            type="number"
            name="quantity"
            value={accessory.quantity}
            id={`quantity-${accessory.id}`}
          />
          <button className="transparent-button destroy" type="button" onClick={() => onToggleRemove(accessory.uniqueId)}>
            <i className="fa fa-trash" />
          </button>
        </div>
      ))}
      <div>
        <Button onClick={onAdd} type="primary">{I18n.t('apps.hardware_devices.add_accessory')}</Button>
      </div>
    </>
  );
}
