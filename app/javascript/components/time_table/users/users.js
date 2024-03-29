import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { NavLink } from 'react-router-dom';
import User from './user';

function Users() {
  const [users, setUsers] = useState([]);
  const [visibility, setVisibility] = useState('active');

  function getUsers() {
    fetch(`/api/users?filter=${visibility}`)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      });
  }

  const handleExportToCsv = () => {
    const path = `/api/users/export.csv?filter=${visibility}`;
    window.open(path, '_blank');
  };

  useEffect(() => {
    getUsers();
  }, [visibility]);

  return (
    <>
      <Helmet>
        <title>{I18n.t('common.people')}</title>
      </Helmet>
      <div className="users-header">
        <div className="input-group mb-3 w-25">
          <div className="input-group-prepend">
            <NavLink className="btn btn-secondary" to="/users/new">{I18n.t('common.add')}</NavLink>
          </div>
          <select
            name="visibility"
            id="filter"
            className="custom-select"
            onChange={(e) => setVisibility(e.target.value)}
            value={visibility}
          >
            <option value="active">{I18n.t('common.active')}</option>
            <option value="inactive">{I18n.t('common.inactive')}</option>
            <option value="all">{I18n.t('common.all')}</option>
          </select>
        </div>
        <div>
          <button type="button" className="btn btn-secondary" onClick={handleExportToCsv}>
            {I18n.t('apps.users.export_to_csv')}
          </button>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th />
            <th>{I18n.t('apps.users.last_name')}</th>
            <th>{I18n.t('apps.users.first_name')}</th>
            <th>Email</th>
            <th>{I18n.t('apps.users.contract_id')}</th>
            <th>{I18n.t('apps.users.phone')}</th>
            <th>{I18n.t('apps.users.department')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          { users.map((user) => <User key={user.id} user={user} />) }
        </tbody>
      </table>
    </>
  );
}

export default Users;
