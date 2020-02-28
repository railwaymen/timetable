import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import * as Api from '../../shared/api';
import { unnullifyFields } from '../../shared/helpers';
import Preloader from '../../shared/preloader';
import AdminFields from './admin_fields';
import UserFields from './user_fields';

function EditUser(props) {
  const userId = parseInt(props.match.params.id, 10);

  const [user, setUser] = useState({});
  const [errors, setErrors] = useState({});
  const [redirectToReferer, setRedirectToReferer] = useState();

  function getUser() {
    if (!userId) return;

    Api.makeGetRequest({ url: `/api/users/${userId}` })
      .then((response) => {
        const updatedUser = unnullifyFields(response.data);
        setUser(updatedUser);
      });
  }

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
        }).catch((results) => {
          setErrors(results.errors);
        });
    } else {
      Api.makePostRequest({ url: '/api/users', body: { user } })
        .then(() => {
          setRedirectToReferer('/users');
        }).catch((results) => {
          setErrors(results.errors);
        });
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    saveUser();
  }

  function renderFields() {
    if (user.id === userId || !userId) {
      return currentUser.admin
        ? <AdminFields user={user} errors={errors} onChange={onChange} onCheckboxChange={onCheckboxChange} />
        : <UserFields user={user} errors={errors} onChange={onChange} />;
    }

    return <Preloader rowsNumber={5} />;
  }

  useEffect(() => {
    getUser();
  }, []);

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
