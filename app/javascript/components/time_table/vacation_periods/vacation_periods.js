import React, { useState, useEffect } from 'react';
import URI from 'urijs';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import * as Api from '../../shared/api';
import VacationPeriod from './vacation_period';
import Dropdown from '../../shared/dropdown';

function VacationPeriods() {
  const [vacationPeriods, setVacationPeriods] = useState([]);
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);

  function getVacationPeriods(userId) {
    Api.makeGetRequest({
      url: `/api/vacation_periods?user_id=${userId}`,
    }).then((response) => {
      const responseVacationPeriods = response.data.records;
      Api.makeGetRequest({
        url: `/api/users/${userId}`,
      }).then((userResponse) => {
        setVacationPeriods(responseVacationPeriods);
        setUser(userResponse.data);
      });
    });
  }

  function getUsers() {
    if (window.currentUser.admin) {
      fetch('/api/users?filter=active&staff')
        .then((response) => response.json())
        .then((data) => {
          setUsers(data);
        });
    }
  }

  useEffect(() => {
    const base = URI(window.location.href);
    const params = base.query(true);
    const userId = (params.user_id || currentUser.id);

    getVacationPeriods(userId);
    getUsers();
  }, []);

  function onGenerateClick() {
    Api.makePostRequest({
      url: '/api/vacation_periods/generate',
      body: { user_id: user.id },
    }).then((response) => {
      setVacationPeriods(response.data);
    });
  }

  function onPreviousUserChange() {
    const id = user.prev_id;

    if (id) {
      getVacationPeriods(id);
      window.history.pushState('TimeTable',
        'Vacation Periods',
        URI(window.location.href).search({ user_id: id }));
    }
  }

  function onNextUserChange() {
    const id = user.next_id;

    if (id) {
      getVacationPeriods(id);
      window.history.pushState('TimeTable',
        'Vacation Periods',
        URI(window.location.href).search({ user_id: id }));
    }
  }

  function RenderUserInfo() {
    if (_.isEmpty(user)) {
      return (
        <div style={{ width: '390px', display: 'inline-block' }} className="preloader" />
      );
    }
    return (
      <span><NavLink to={`/timesheet?user_id=${user.id}`}>{`${user.first_name} ${user.last_name}`}</NavLink></span>
    );
  }

  function FilterUsers(filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(users, (u) => (
      u.active && (`${u.first_name} ${u.last_name}`.toLowerCase().match(lowerFilter) || `${u.last_name} ${u.first_name}`.toLowerCase().match(lowerFilter))
    ));
  }

  function renderSelectedUser(currentlySelectedUser) {
    return (
      <div>
        <b>
          {`${currentlySelectedUser.first_name} ${currentlySelectedUser.last_name}`}
        </b>
      </div>
    );
  }

  function RenderUsersList(listedUser, currentlySelectedUser) {
    return (
      <div>
        {listedUser.id === currentlySelectedUser.id ? (
          <b>
            {`${listedUser.first_name} ${listedUser.last_name}`}
          </b>
        ) : `${listedUser.first_name} ${listedUser.last_name}`}
      </div>
    );
  }

  return (
    <div className="vacation-periods-list accounting-periods-list">
      <Helmet>
        <title>{`${I18n.t('common.vacation_periods')}`}</title>
      </Helmet>
      { currentUser.admin && (
        <div className="row periods-actions">
          <div className="col-auto mr-auto">
            <div id="generate" className="btn btn-outline-secondary" onClick={onGenerateClick}>
              {I18n.t('apps.vacation_periods.generate_periods')}
              <i className="ml-2 fa fa-calendar-plus-o" />
            </div>
          </div>
          <div className="col-auto user-filter">
            <Dropdown
              objects={users}
              updateObject={(selectedUser) => getVacationPeriods(selectedUser.id)}
              selectedObject={user}
              filterObjects={FilterUsers}
              renderSelectedObject={RenderSelectedUser}
              renderObjectsList={RenderUsersList}
            />
          </div>
        </div>
      )}
      <div className="offset-md-3 col-md-6 vert-offset-bottom clearfix">
        { currentUser.admin && (
          <h3 className="text-center text-muted">
            {user.prev_id && (
              <a onClick={onPreviousUserChange} className="fa fa-chevron-left pull-left" />
            )}
            <RenderUserInfo />
            <span>
              {user.next_id && (
                <a onClick={onNextUserChange} className="fa fa-chevron-right pull-right" />
              )}
            </span>
          </h3>
        )}
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>{I18n.t('common.person')}</th>
            <th>{I18n.t('common.from')}</th>
            <th>{I18n.t('common.to')}</th>
            <th>{I18n.t('apps.vacation_periods.vacation_days')}</th>
            <th className="text-left">{I18n.t('apps.vacation_periods.note')}</th>
            {currentUser.admin && <th />}
          </tr>
        </thead>
        <tbody>
          { vacationPeriods.map((period) => (
            <VacationPeriod
              key={period.id}
              period={period}
              userName={user ? `${user.first_name} ${user.last_name}` : `${currentUser.first_name} ${currentUser.last_name}`}
            />
          )) }
        </tbody>
      </table>
    </div>
  );
}

export default VacationPeriods;
