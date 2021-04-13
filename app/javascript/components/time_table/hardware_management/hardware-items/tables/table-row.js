import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Tag from '../../shared/tag';

export default function TableRow({ item, onRemove }) {
  const [showActions, setShowActions] = useState(false);

  const toggleActions = () => {
    setShowActions((state) => !state);
  };

  const onRemoveItem = () => {
    onRemove(item);
    setShowActions(false);
  };

  return (
    <tr>
      <td><b>{I18n.t(`apps.hardware_devices.${item.category}`)}</b></td>
      <td>{item.brand}</td>
      <td>{item.model}</td>
      <td>{item.serial_number}</td>
      <td>
        <b>{item.user ? `${item.user.first_name} ${item.user.last_name}` : I18n.t('apps.hardware_devices.unassigned')}</b>
      </td>
      <td>
        <Tag>{item.state}</Tag>
      </td>
      <td>{item.year_of_production}</td>
      <td>
        <div className="item-actions">
          <button className="transparent-button" type="button" onClick={toggleActions}>
            <i className="fa fa-ellipsis-v" />
          </button>
          {showActions && (
            <div className="tooltip">
              <Link to={`/hardware-devices/${item.id}/show`} className="item transparent-button">{I18n.t('apps.hardware_devices.show_details')}</Link>
              <Link to={`/hardware-devices/${item.id}/edit`} className="item transparent-button">{I18n.t('common.edit')}</Link>
              <button onClick={onRemoveItem} type="button" className="item transparent-button danger">{I18n.t('common.remove')}</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
