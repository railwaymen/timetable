import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { makeDeleteRequest } from '../../shared/api';
import ConfirmModal from './hardware-item/confirm-modal';
import ActiveContent from './hardware-items/tables/active-content';
import ArchivedContent from './hardware-items/tables/archived-content';

export default function HardwareList() {
  const [selectedList, setSelectedList] = useState('active');

  const [query, setQuery] = useState('');
  const [unassignedDevicesOnly, setUnassignedDevicesOnly] = useState(false);

  const [searchPhrase, setSearchPhrase] = useState({ query, unassigned: false });
  const [selectedItem, setSelectedItem] = useState(null);
  const [containerFingerprint, setContainerFingerprint] = useState(new Date());

  const onSearch = (e) => {
    e.preventDefault();

    setSearchPhrase({ query, unassigned: unassignedDevicesOnly });
  };

  const onRemove = () => {
    const { id } = selectedItem;

    makeDeleteRequest({
      url: `/api/hardware_devices/${id}`,
    }).then(() => {
      setContainerFingerprint(new Date());
      setSelectedItem(null);
    });
  };

  const onCancel = () => {
    setSelectedItem(null);
  };

  return (
    <div className="hardware-content">
      <ConfirmModal
        visible={selectedItem}
        onCancel={onCancel}
        onConfirm={onRemove}
        confirmTitle={selectedItem?.archived ? I18n.t('apps.hardware_devices.remove') : I18n.t('apps.hardware_devices.archive')}
        title={I18n.t('apps.hardware_devices.remove_title')}
      >
        <p>{I18n.t('apps.hardware_devices.remove_body')}</p>
      </ConfirmModal>
      <div className="header">
        <form onSubmit={onSearch}>
          <div>
            <label htmlFor="unassignedDevicesOnly">{I18n.t('apps.hardware_devices.show_unassigned_only')}</label>
            <input
              id="unassignedDevicesOnly"
              type="checkbox"
              checked={unassignedDevicesOnly}
              onChange={() => setUnassignedDevicesOnly(!unassignedDevicesOnly)}
            />
          </div>
          <input type="text" value={query} onChange={({ target: { value } }) => setQuery(value)} />
          <button className="search-button" type="submit" onClick={onSearch}>{I18n.t('common.search')}</button>
        </form>
        <div>
          <Link to="/hardware-devices/new" className="action-button primary edit">
            <i className="fa fa-plus space-md" />
            <span className="space-md">{I18n.t('apps.hardware_devices.add')}</span>
          </Link>
        </div>
      </div>
      <div className="body">
        <div className="tabs">
          <button type="button" className={`tab ${selectedList === 'active' && 'active'}`} onClick={() => setSelectedList('active')}>
            {I18n.t('common.active')}
          </button>
          <button type="button" className={`tab ${selectedList === 'inactive' && 'active'}`} onClick={() => setSelectedList('inactive')}>
            {I18n.t('common.inactive')}
          </button>
        </div>
        <ActiveContent
          visible={selectedList === 'active'}
          phrase={searchPhrase}
          onSelectItem={setSelectedItem}
          key={`active-${containerFingerprint}`}
        />
        <ArchivedContent
          visible={selectedList === 'inactive'}
          phrase={searchPhrase}
          onSelectItem={setSelectedItem}
          key={`archived-${containerFingerprint}`}
        />
      </div>
    </div>
  );
}
