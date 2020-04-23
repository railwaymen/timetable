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

  useEffect(() => {
    getUsers();
  }, [visibility]);

  return (
    <div>
      <Helmet>
        <title>{I18n.t('common.people')}</title>
      </Helmet>
      <div className="actions pull-left mb-3">
        <div className="disabled-button-wrapper" data-toggle="tooltip" data-placement="right" title="button_disabled_tooltip">
          <NavLink className="btn btn-secondary" to="/users/new">{I18n.t('common.add')}</NavLink>
        </div>
      </div>
      <div className="pull-left mb-3">
        <select
          name="visibility"
          id="filter"
          className="form-control"
          onChange={(e) => setVisibility(e.target.value)}
          value={visibility}
        >
          <option value="active">{I18n.t('apps.users.active')}</option>
          <option value="inactive">{I18n.t('apps.users.inactive')}</option>
          <option value="all">{I18n.t('apps.users.all')}</option>
        </select>
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
            <th />
          </tr>
        </thead>
        <tbody>
          { users.map((user) => <User key={user.id} user={user} />) }
        </tbody>
      </table>
    </div>
  );
}

export default Users;
