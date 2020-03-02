import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Entry from './entry';
import EntryHistory from './entry_history';
import * as Api from '../../shared/api';

function Vacations() {
  const [vacationsInfo, setVacationsInfo] = useState({ vacations: [], availableVacationDays: 0, usedVacationDays: {} });
  const [selectedYear, setSelectedYear] = useState(parseInt(moment().year(), 10));
  const [selectedUser, setSelectedUser] = useState(window.currentUser.id.toString());

  function getVacations() {
    let url = `/api/vacations?year=${selectedYear}`;
    if (window.currentUser.staff_manager) { url += `&user_id=${selectedUser}`; }
    Api.makeGetRequest({ url })
      .then((response) => {
        const vacationsInfoResponse = {
          vacations: response.data.vacations,
          availableVacationDays: response.data.available_vacation_days,
          usedVacationDays: response.data.used_vacation_days,
        };
        setVacationsInfo(vacationsInfoResponse);
      });
  }

  useEffect(() => {
    getVacations();
  }, [selectedYear, selectedUser]);

  return (
    <div className="container vacation-entry">
      <div className="row">
        <div className="vacations-container">
          <Entry selectedUser={selectedUser} setSelectedUser={setSelectedUser} getVacations={getVacations} />
          <EntryHistory vacationsInfo={vacationsInfo} selectedYear={selectedYear} setSelectedYear={setSelectedYear} getVacations={getVacations} />
        </div>
      </div>
    </div>
  );
}

export default Vacations;
