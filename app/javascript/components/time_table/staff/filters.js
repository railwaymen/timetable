import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import URI from 'urijs';
import { defaultDatePickerProps } from '../../shared/helpers';

function Filters(props) {
  const [users, setUsers] = useState([]);
  const { filters, setFilters, defaultFilters } = props;
  const { selectedUser, startDate, endDate } = filters;

  function getUsers() {
    fetch('/api/users?filter=active&staff')
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      });
  }

  useEffect(() => {
    getUsers();
  }, []);

  function Users() {
    const options = [];
    users.forEach((user) => {
      options.push(
        <option key={user.id} value={user.id}>
          {user.accounting_name}
        </option>,
      );
    });

    return (
      <div className="user-filter">
        <select className="form-control user-select-filter" value={selectedUser} onChange={(e) => setFilters({ ...filters, selectedUser: e.target.value })}>
          <option value="">{I18n.t('apps.staff.by_person')}</option>
          {options}
        </select>
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
