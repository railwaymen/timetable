import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import User from './user';

function Users() {
  const [users, setUsers] = useState([]);
  const [visibility, setVisibility] = useState('active');

  function getUsers(isVisible) {
    fetch(`/api/users?filter=${isVisible}`)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      });
  }

  useEffect(() => {
    getUsers(visibility);
  }, [visibility]);

  return (
    <div>
      <div className="actions pull-left">
        <div className="disabled-button-wrapper" data-toggle="tooltip" data-placement="right" title="button_disabled_tooltip">
          <NavLink className="btn btn-default" to="/users/new">{I18n.t('common.add')}</NavLink>
        </div>
      </div>
      <div className="pull-left">
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
