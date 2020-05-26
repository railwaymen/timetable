import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useFormHandler from '@hooks/use_form_handler';
import _ from 'lodash';
import * as Api from '../../shared/api';
import { unnullifyFields } from '../../shared/helpers';
import Preloader from '../../shared/preloader';
import translateErrors from '../../shared/translate_errors';
import AdminFields from './admin_fields';
import UserFields from './user_fields';

function EditUser(props) {
  const userId = parseInt(props.match.params.id, 10);

  const [user, setUser, onChange] = useFormHandler({ position_list: [] });
  const [errors, setErrors] = useState({});
  const [redirectToReferer, setRedirectToReferer] = useState();

  function getUser(id = userId) {
    if (!userId) return;

    Api.makeGetRequest({ url: `/api/users/${id}` })
      .then((response) => {
        const updatedUser = unnullifyFields(response.data);
        setUser(updatedUser);
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
          setErrors(translateErrors('user', results.errors));
        });
    } else {
      Api.makePostRequest({ url: '/api/users', body: { user } })
        .then(() => setRedirectToReferer('/users'))
        .catch((results) => setErrors(translateErrors('user', results.errors)));
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    saveUser();
  }

  function renderFields() {
    if (user.id === userId || !userId) {
      return currentUser.admin
        ? <AdminFields user={user} errors={errors} onChange={onChange} setUser={setUser} />
        : <UserFields user={user} errors={errors} onChange={onChange} />;
    }

    return <Preloader rowsNumber={5} />;
  }

  useEffect(() => {
    getUser();
  }, []);

  function UserInfo() {
    if (_.isEmpty(user)) {
      return (
        <div style={{ width: '390px', display: 'inline-block' }} className="preloader" />
      );
    }
    return (
      <span><NavLink to={`/timesheet?user_id=${user.id}`}>{`${user.first_name} ${user.last_name}`}</NavLink></span>
    );
  }

  function UsersNavigation() {
    return (
      <>
        { currentUser.admin && (
          <div className="offset-md-3 col-md-6 vert-offset-bottom clearfix">
            <h3 className="text-center text-muted">
              {user.prev_id && (
                <NavLink to={`/users/edit/${user.prev_id}`} className="fa fa-chevron-left pull-left" onClick={() => getUser(user.prev_id)} />
              )}
              <UserInfo />
              {user.next_id && (
                <NavLink to={`/users/edit/${user.next_id}`} className="fa fa-chevron-right pull-right" onClick={() => getUser(user.next_id)} />
              )}
            </h3>
          </div>
        )}
      </>
    );
  }

  if (redirectToReferer) return <Redirect to={redirectToReferer} />;

  return (
    <form>
      <UsersNavigation />
      <Helmet>
        {user.id ? (
          <title>{`${I18n.t('common.edit')} ${user.accounting_name}`}</title>
        ) : (
          <title>{I18n.t('apps.users.new')}</title>
        )}
      </Helmet>
      {renderFields()}
      <div className="btn-group">
        <NavLink activeClassName="" className="btn btn-secondary" to="/users">{I18n.t('common.cancel')}</NavLink>
        <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={onSubmit} />
      </div>
    </form>
  );
}

export default EditUser;
