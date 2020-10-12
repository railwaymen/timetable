import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import { locationParams, replaceLocationParams } from '@components/shared/helpers';
import Entry from './entry';
import EntryHistory from './entry_history';
import { makeGetRequest } from '../../shared/api';
import * as Api from '../../shared/api';

function Vacations() {
  const [vacationsInfo, setVacationsInfo] = useState({ vacations: [], availableVacationDays: 0, usedVacationDays: {} });
  const [selectedYear, setSelectedYear] = useState(parseInt(moment().year(), 10));
  const params = locationParams();
  const userId = parseInt(params.user_id, 10) || currentUser.id;
  const [user, setUser] = useState({ id: userId });

  function getVacations() {
    const url = `/api/vacations?year=${selectedYear}&user_id=${user.id}`;
    Api.makeGetRequest({ url })
      .then((response) => {
        const vacationsInfoResponse = {
          vacations: response.data.records,
          availableVacationDays: response.data.available_vacation_days,
          usedVacationDays: response.data.used_vacation_days,
        };
        setVacationsInfo(vacationsInfoResponse);
      });
  }

  function getUser() {
    makeGetRequest({ url: `/api/users/${user.id}` })
      .then((userResponse) => {
        setUser(userResponse.data);
      });
  }

  useEffect(() => {
    getUser();
  }, [user.id]);

  useEffect(() => {
    getVacations();
    replaceLocationParams({ user_id: user.id });
  }, [selectedYear, user]);

  return (
    <div className="container-fluid vacation-entry">
      <Helmet>
        <title>{I18n.t('common.vacations')}</title>
      </Helmet>
      <div className="row">
        <Entry user={user} setUser={setUser} getVacations={getVacations} />
        <EntryHistory
          vacationsInfo={vacationsInfo}
          user={user}
          setUser={setUser}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          getVacations={getVacations}
        />
      </div>
    </div>
  );
}

export default Vacations;
