import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import moment from 'moment';
import * as Api from '../../shared/api';
import { unnullifyFields } from '../../shared/helpers';
import Preloader from '../../shared/preloader';

function EditUser(props) {
  const userId = parseInt(props.match.params.id, 10);

  const [user, setUser] = useState({});
  const [redirectToReferer, setRedirectToReferer] = useState();

  function getUser() {
    if (!userId) return;

    Api.makeGetRequest({ url: `/api/users/${userId}` })
      .then((response) => {
        const updatedUser = unnullifyFields(response.data);
        setUser(updatedUser);
      });
  }

  useEffect(() => {
    getUser();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
    });
  }

  function onCheckboxChange(e) {
    const { name } = e.target;

    setUser({
      ...user,
      [name]: !user[name],
    });
  }

  function saveUser() {
    if (userId) {
      Api.makePutRequest({ url: `/api/users/${user.id}`, body: { id: user.id, user } })
        .then(() => {
          if (user.lang !== currentUser.lang) {
            window.location.href = currentUser.admin ? '/users' : '/timesheet';
          } else {
            setRedirectToReferer(currentUser.admin ? '/users' : '/timesheet');
          }

          if (currentUser.id === user.id) window.currentUser = { ...currentUser, ...user };
        });
    } else {
      Api.makePostRequest({ url: '/api/users', body: { user } })
        .then(() => {
          setRedirectToReferer('/users');
        });
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    saveUser();
  }

  function renderAdminFields() {
    return (
      <div>
        <div className="form-group">
          <input className="form-control" type="text" name="email" placeholder="Email" onChange={onChange} value={user.email || ''} />
        </div>

        <div className="form-group">
          <input className="form-control" type="text" name="first_name" placeholder={I18n.t('apps.users.first_name')} onChange={onChange} value={user.first_name || ''} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="last_name" placeholder={I18n.t('apps.users.last_name')} value={user.last_name || ''} onChange={onChange} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="contract_name" placeholder={I18n.t('apps.users.contract_id')} value={user.contract_name || ''} onChange={onChange} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="phone" placeholder={I18n.t('apps.users.phone')} value={user.phone || ''} onChange={onChange} />
        </div>
        <div className="form-group">
          <input type="date" name="birthdate" value={moment(user.birthdate).format('YYYY-MM-DD')} onChange={onChange} />
        </div>
        { user.id !== currentUser.id && (
          <div className="form-group">
            <label>
              {I18n.t('apps.users.user_active')}
              <input type="checkbox" name="active" checked={user.active || false} onChange={onCheckboxChange} />
            </label>
          </div>
        )}
        <div className="form-group">
          <select className="form-control" name="lang" onChange={onChange} value={user.lang}>
            <option value="pl">pl</option>
            <option value="en">en</option>
          </select>
        </div>
      </div>
    );
  }

  function renderUserFields() {
    return (
      <div>
        <div className="form-group">
          <input className="form-control" type="text" name="first_name" placeholder={I18n.t('apps.users.first_name')} onChange={onChange} value={user.first_name} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="last_name" placeholder={I18n.t('apps.users.last_name')} value={user.last_name} onChange={onChange} />
        </div>
        <div className="form-group">
          <select className="form-control" name="lang" onChange={onChange} value={user.lang}>
            <option value="pl">pl</option>
            <option value="en">en</option>
          </select>
        </div>
      </div>
    );
  }

  function renderFields() {
    if (user.id === userId || !userId) {
      return currentUser.admin ? renderAdminFields() : renderUserFields();
    }

    return <Preloader rowsNumber={5} />;
  }

  if (redirectToReferer) return <Redirect to={redirectToReferer} />;

  return (
    <form>
      {renderFields()}
      <NavLink activeClassName="" className="btn btn-default" to="/users">{I18n.t('common.cancel')}</NavLink>
      <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={onSubmit} />
    </form>
  );
}

export default EditUser;
