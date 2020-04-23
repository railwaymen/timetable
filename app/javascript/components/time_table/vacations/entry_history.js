import React, { useState, useEffect } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api';

function EntryHistory(props) {
  const {
    vacationsInfo, selectedYear, setSelectedYear, getVacations,
  } = props;
  const { vacations, availableVacationDays, usedVacationDays } = vacationsInfo;
  const [usedVacationsExpanded, setUsedVacationsExpanded] = useState(false);
  const [collapsibleProperties, setCollapsibleProperties] = useState({});
  const [years, setYears] = useState([]);

  function getYears() {
    const currentYear = parseInt(moment().year(), 10);
    const tempYears = [currentYear];
    const iterator = moment().format('YYYY') - moment('2019', 'YYYY').year();
    for (let i = 0; i < iterator; i += 1) {
      tempYears.push(currentYear - (i + 1));
    }
    setYears(tempYears.sort());
  }

  useEffect(() => {
    getYears();
  }, []);

  function onTrashClick(vacationId) {
    if (window.confirm(I18n.t('common.confirm'))) {
      Api.makePutRequest({
        url: `/api/vacations/${vacationId}/self_decline`,
      }).then(() => {
        getVacations(selectedYear);
      });
    }
  }

  function Vacation({ vacation }) {
    const [status, statusClass] = vacation.status === 'approved' ? (
      [I18n.t('apps.vacations.status.unconfirmed'), 'unconfirmed']
    ) : (
      [I18n.t(`apps.vacations.status.${vacation.status}`), vacation.status]
    );
    return (
      <tr className="vacation">
        <td className="text-left">{I18n.t(`common.${vacation.vacation_type}`)}</td>
        <td>
          {moment(vacation.start_date).format('DD.MM.YYYY')}
          <span>-</span>
          {moment(vacation.end_date).format('DD.MM.YYYY')}
        </td>
        <td>{I18n.t('apps.birthday_templates.days', { count: vacation.business_days_count })}</td>
        <td className={statusClass}>{status}</td>
        <td className="trash text-right">
          <button className="btn btn-outline-danger" onClick={() => onTrashClick(vacation.id)}>
            {vacation.status === 'unconfirmed' ? (
              <i className="symbol fa fa-trash" />
            ) : '' }
          </button>
        </td>
      </tr>
    );
  }

  function YearFilter() {
    const options = [];
    for (let i = 0; i < years.length; i += 1) {
      options.push(<option key={i} value={years[i]}>{years[i]}</option>);
    }
    return (
      <select className="form-control" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}>
        {options}
      </select>
    );
  }

  function UsedVacationDays() {
    const usedVacationDaysList = [];
    Object.keys(usedVacationDays).forEach((type) => {
      usedVacationDaysList.push(
        <div className={type} key={type}>
          {I18n.t('apps.vacations.used_vacation_days', { type: I18n.t(`common.${type}`).toLowerCase() })}
          <span>{I18n.t('apps.vacations.days', { count: usedVacationDays[type] })}</span>
        </div>,
      );
    });
    const { chevron, translation, className } = collapsibleProperties;
    return (
      <div className="used-vacations">
        <button
          className="btn btn-link px-0"
          type="button"
          data-toggle="collapse"
          data-target="#used-vacations-collapse"
          aria-expanded="false"
          aria-controls="used-vacations-collapse"
        >
          <i className={`mr-2 fa fa-chevron-${chevron}`} />
          {I18n.t(`apps.vacations.${translation}`)}
        </button>
        <div className={`collapse ${className}`} id="used-vacations-collapse">
          {usedVacationDaysList}
        </div>
      </div>
    );
  }

  useEffect(() => {
    const [chevron, translation, className] = usedVacationsExpanded ? ['up', 'fold_used_days', 'show'] : ['down', 'expand_used_days', 'hide'];
    setCollapsibleProperties({ chevron, translation, className });
  }, [usedVacationsExpanded]);

  return (
    <div className="w-100">
      <div className="row mx-0 align-items-center">
        <div className="available-vacation-days mb-0">
          {I18n.t('apps.vacations.remaining_vacation')}
          <span>{I18n.t('apps.vacations.days', { count: availableVacationDays })}</span>
        </div>
        <div className="ml-auto year-filter">
          <YearFilter />
        </div>
      </div>
      <div className="row mx-0 my-3">
        <UsedVacationDays />
      </div>
      <div className="row mx-0">
        <div className="vacations w-100">
          <table>
            <tbody>
              {vacations.map((vacation) => <Vacation key={vacation.id} vacation={vacation} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

EntryHistory.propTypes = {
  vacationsInfo: PropTypes.object.isRequired,
  selectedYear: PropTypes.number.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
  getVacations: PropTypes.func.isRequired,
};

export default EntryHistory;
