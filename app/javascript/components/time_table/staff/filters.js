import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import URI from 'urijs';
import _ from 'lodash';
import { defaultDatePickerProps } from '../../shared/helpers';
import * as Api from '../../shared/api';
import Dropdown from '../../shared/dropdown';

function Filters(props) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const { filters, setFilters, defaultFilters } = props;
  const { selectedUserId, startDate, endDate } = filters;

  function getUsers() {
    fetch('/api/users?filter=active&staff')
      .then((response) => response.json())
      .then((data) => {
        data.unshift({
          first_name: I18n.t('apps.staff.user'), last_name: I18n.t('apps.staff.choose'), id: 0, active: true,
        });
        setUsers(data);
      });
  }

  function getUser() {
    if (!selectedUserId) { return; }

    Api.makeGetRequest({ url: `/api/users/${selectedUserId}` })
      .then((userResponse) => {
        setSelectedUser(userResponse.data);
      });
  }

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    getUser();
  }, [selectedUserId]);

  function FilterUsers(filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(users, (u) => (
      u.active && (`${u.first_name} ${u.last_name}`.toLowerCase().match(lowerFilter) || `${u.last_name} ${u.first_name}`.toLowerCase().match(lowerFilter))
    ));
  }

  function RenderSelectedUser(currentlySelectedUser) {
    return (
      <div>
        {_.isEmpty(currentlySelectedUser) ? (
          <b>
            {I18n.t('apps.staff.choose')}
            {' '}
            {I18n.t('apps.staff.user')}
          </b>
        ) : (
          <b>
            {`${currentlySelectedUser.last_name} ${currentlySelectedUser.first_name}`}
          </b>
        )}
      </div>
    );
  }

  function RenderUsersList(user, currentlySelectedUser) {
    return (
      <div>
        {user.id === currentlySelectedUser.id ? (
          <b>
            {`${user.last_name} ${user.first_name}`}
          </b>
        ) : `${user.last_name} ${user.first_name}`}
      </div>
    );
  }

  function changeSelectedUser(currentlySelectedUser) {
    if (currentlySelectedUser.id === 0) { currentlySelectedUser = {}; }
    setFilters({ ...filters, selectedUserId: currentlySelectedUser.id });
    setSelectedUser(currentlySelectedUser);
  }

  function Users() {
    return (
      <div className="user-filter">
        <Dropdown
          objects={users}
          updateObject={changeSelectedUser}
          selectedObject={selectedUser}
          filterObjects={FilterUsers}
          renderSelectedObject={RenderSelectedUser}
          renderObjectsList={RenderUsersList}
        />
      </div>
    );
  }

  function GeneralButton() {
    return (
      <div className="general-button">
        <button className="filter-button bt-vacation" type="button" onClick={() => setFilters(defaultFilters)}>
          <span className="bt-txt">{I18n.t('apps.staff.general')}</span>
        </button>
      </div>
    );
  }

  function DateRange() {
    return (
      <>
        <div className="start-date-filter">
          <DatePicker
            {...defaultDatePickerProps}
            name="startDate"
            className="form-control"
            selected={startDate === null ? null : moment(startDate, 'DD/MM/YYYY')}
            value={startDate === null ? null : moment(startDate, 'DD/MM/YYYY').format('DD/MM/YYYY')}
            format="DD/MM/YYYYs"
            dateFormat="DD/MM/YYYY"
            onChange={(date) => setFilters({ ...filters, startDate: (date ? date.format('DD/MM/YYYY') : null) })}
            onSelect={(date) => setFilters({ ...filters, startDate: (date ? date.format('DD/MM/YYYY') : null) })}
          />
        </div>
        <div className="end-date-filter">
          <DatePicker
            {...defaultDatePickerProps}
            name="endDate"
            className="form-control"
            selected={endDate === null ? null : moment(endDate, 'DD/MM/YYYY')}
            value={endDate === null ? null : moment(endDate, 'DD/MM/YYYY').format('DD/MM/YYYY')}
            format="DD/MM/YYYYs"
            dateFormat="DD/MM/YYYY"
            onChange={(date) => setFilters({ ...filters, endDate: (date ? date.format('DD/MM/YYYY') : null) })}
            onSelect={(date) => setFilters({ ...filters, endDate: (date ? date.format('DD/MM/YYYY') : null) })}
          />
        </div>
      </>
    );
  }

  function exportCsv() {
    const url = URI(window.location.href);
    window.open(`/api/vacations/generate_csv.csv?${url.query()}`, '_blank');
  }

  function exportYearlyReport() {
    window.open('/api/vacations/generate_yearly_report.csv', '_blank');
  }

  function CsvButton() {
    return (
      <div className="csv-export-button">
        <button className="filter-button bt-vacation" type="button" onClick={exportCsv}>
          <span className="bt-txt">{I18n.t('apps.staff.csv_export')}</span>
        </button>
      </div>
    );
  }

  function YearlyButton() {
    return (
      <div className="yearly-report">
        <button className="filter-button bt-vacation" type="button" onClick={exportYearlyReport}>
          <span className="bt-txt">{I18n.t('apps.staff.yearly_report')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid filters">
      <div className="row">
        <GeneralButton />

        <Users />

        <DateRange />
        { currentUser.staff_manager && (
          <div className="generator-buttons">
            <CsvButton />

            <YearlyButton />
          </div>
        )}
      </div>
    </div>
  );
}

Filters.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  defaultFilters: PropTypes.object.isRequired,
};

export default Filters;
