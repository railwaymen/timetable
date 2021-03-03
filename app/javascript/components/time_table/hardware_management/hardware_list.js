import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ActiveContent from './hardware-items/tables/active-content';
import ArchivedContent from './hardware-items/tables/archived-content';

export default function HardwareList() {
  const [selectedList, setSelectedList] = useState('active');

  const [query, setQuery] = useState('');
  const [searchPhrase, setSearchPhrase] = useState('');

  const onSearch = () => {
    setSearchPhrase(query);
  };

  return (
    <div className="hardware-content">
      <div className="header">
        <div>
          <input type="text" value={query} onChange={({ target: { value } }) => setQuery(value)} />
          <button className="search-button" type="submit" onClick={onSearch}>{I18n.t('common.search')}</button>
        </div>
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
        />
        <ArchivedContent
          visible={selectedList === 'inactive'}
          phrase={searchPhrase}
        />
      </div>
    </div>
  );
}
