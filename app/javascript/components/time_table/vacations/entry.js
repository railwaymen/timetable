import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import _ from 'lodash';
import URI from 'urijs';
import ErrorTooltip from '@components/shared/error_tooltip';
import { defaultDatePickerProps } from '../../shared/helpers';
import translateErrors from '../../shared/translate_errors';
import * as Api from '../../shared/api';
import * as Validations from '../../shared/validations';
import Description from './description_field';

const defaultVacation = {
  startDate: moment().format('DD/MM/YYYY'),
  endDate: moment().format('DD/MM/YYYY'),
  description: '',
  vacationType: 'planned',
};

function Entry(props) {
  const [vacation, setVacation] = useState(defaultVacation);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const {
    startDate, endDate, description, vacationType,
  } = vacation;
  const { selectedUser, setSelectedUser, getVacations } = props;

  useEffect(() => {
    if (window.currentUser.staff_manager) {
      fetch('/api/users?filter=active&staff')
        .then((response) => response.json())
        .then((data) => {
          setUsers(data);
        });
    }
  }, []);

  useEffect(() => {
    setErrors({});
  }, [vacation]);

  function onVacationChange(name, value) {
    setVacation({
      ...vacation,
      [name]: value,
    });
  }

  function DateRange() {
    return (
      <>
        <div className="date">
          {errors.startDate && <ErrorTooltip errors={errors.startDate} className="vacation-errors" />}
          <DatePicker
            {...defaultDatePickerProps}
            name="start_date"
            className="form-control"
            selected={moment(startDate, 'DD/MM/YYYY')}
            value={moment(startDate, 'DD/MM/YYYY').format('DD/MM/YYYY')}
            format="DD/MM/YYYYs"
            dateFormat="DD/MM/YYYY"
            onChange={(date) => onVacationChange('startDate', date.format('DD/MM/YYYY'))}
            onSelect={(date) => onVacationChange('startDate', date.format('DD/MM/YYYY'))}
          />
        </div>
        <div className="date">
          {errors.endDate && <ErrorTooltip errors={errors.endDate} className="vacation-errors" />}
          <DatePicker
            {...defaultDatePickerProps}
            name="end_date"
            className="form-control"
            selected={moment(endDate, 'DD/MM/YYYY')}
            value={moment(endDate, 'DD/MM/YYYY').format('DD/MM/YYYY')}
            format="DD/MM/YYYYs"
            dateFormat="DD/MM/YYYY"
            onChange={(date) => onVacationChange('endDate', date.format('DD/MM/YYYY'))}
            onSelect={(date) => onVacationChange('endDate', date.format('DD/MM/YYYY'))}
          />
        </div>
      </>
    );
  }

  function VacationTypes() {
    return (
      <div className="vacation-type">
        {errors.vacationType && <ErrorTooltip errors={errors.vacationType} className="vacation-errors" />}
        <select className="form-control" value={vacationType} onChange={(e) => onVacationChange('vacationType', e.target.value)}>
          <option value="planned">{I18n.t('common.planned')}</option>
          <option value="requested">{I18n.t('common.requested')}</option>
          <option value="compassionate">{I18n.t('common.compassionate')}</option>
          <option value="others">{I18n.t('common.others')}</option>
        </select>
      </div>
    );
  }

  function onKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }

  function UserFilter() {
    const options = [];
    users.forEach((user) => {
      options.push(
        <option key={user.id} value={user.id}>
          {`${user.last_name} ${user.first_name}`}
        </option>,
      );
    });
    return (
      <div className="user-filter">
        <select className="form-control user-select-filter" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          {options}
        </select>
      </div>
    );
  }

  function validate() {
    const newErrors = {
      description: (vacationType === 'others' ? Validations.presence(description) : undefined),
      startDate: Validations.presence(startDate),
      endDate: Validations.presence(endDate),
      vacationType: Validations.presence(vacationType),
    };
    Object.keys(newErrors).forEach((key) => { if (newErrors[key] === undefined) { delete newErrors[key]; } });
    return newErrors;
  }

  function onSubmit() {
    const newErrors = validate();
    if (!_.isEmpty(newErrors)) { return setErrors(newErrors); }
    const userId = (window.currentUser.staff_manager) ? parseInt(selectedUser, 10) : URI(window.location.href).search(true).user_id || currentUser.id;
    const entryData = {
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      vacation_type: vacationType,
      description,
    };
    Api.makePostRequest({
      url: '/api/vacations',
      body: { vacation: entryData },
    }).then((response) => {
      const data = _.castArray(response.data);
      if (!data[0].id) {
        throw new Error('Invalid response');
      }
      getVacations();
      const newVacation = {
        description: '',
        vacationType: 'planned',
        startDate: moment().format('DD/MM/YYYY'),
        endDate: moment().format('DD/MM/YYYY'),
      };
      setVacation(newVacation);
    }).catch((e) => {
      // if (e.errors && (e.errors.base || e.errors.start_date || e.errors.end_date || e.errors.description || e.errors.vacation_type)) {
      //   newErrors = {};
      //   if (e.errors.start_date) newErrors.startDate = e.errors.start_date;
      //   if (e.errors.end_date) newErrors.endDate = e.errors.end_date;
      //   if (e.errors.description) newErrors.description = e.errors.description;
      //   if (e.errors.vacation_type) newErrors.vacationType = e.errors.vacation_type;
      //   if (e.errors.base) newErrors.base = e.errors.base;
      setErrors(translateErrors('vacation', e.errors));
      // } else {
      //   alert(I18n.t('activerecord.errors.models.vacation.basic'));
      // }
    });
    if (!_.isEmpty(errors)) {
      return false;
    }
    return true;
  }

  function Submit() {
    return (
      <button type="button" className="bt-vacation" onClick={onSubmit}>
        <span className="bt-txt">{I18n.t('common.send')}</span>
      </button>
    );
  }

  return (
    <div>
      <div className="row vacation-date-range">
        <DateRange />
        <VacationTypes />
      </div>
      <div className="row description-containter">
        <Description
          description={description}
          onVacationChange={onVacationChange}
          onKeyPress={onKeyPress}
          errors={errors}
        />
      </div>
      <div className="row">
        <div className="base-error">
          {errors.base && <ErrorTooltip errors={errors.base} className="vacation-errors" />}
        </div>
      </div>
      <div className="row footer">
        { window.currentUser.staff_manager && users && (
          <UserFilter />
        )}
        <div className="form-actions">
          <Submit />
        </div>
      </div>
    </div>
  );
}

Entry.propTypes = {
  selectedUser: PropTypes.string.isRequired,
  setSelectedUser: PropTypes.func.isRequired,
  getVacations: PropTypes.func.isRequired,
};

export default Entry;
