import React, { useState, useEffect } from 'react';
import { Redirect, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Preloader from '../../shared/preloader';
import * as Api from '../../shared/api';
import VacationPeriodFields from './vacation_period_fields';
import translateErrors from '../../shared/translate_errors';

function EditVacationPeriod(props) {
  const periodId = parseInt(props.match.params.id, 10);
  const [period, setPeriod] = useState({});
  const [redirectToReferer, setRedirectToReferer] = useState(undefined);
  const [errors, setErrors] = useState({});

  function getPeriod(id) {
    Api.makeGetRequest({
      url: `/api/vacation_periods/${id}`,
    }).then((response) => {
      setPeriod(response.data);
    });
  }

  useEffect(() => {
    getPeriod(periodId);
  }, []);

  function onSubmit() {
    Api.makePutRequest({
      url: `/api/vacation_periods/${period.id}`,
      body: { vacation_period: { ...period } },
    }).then(() => {
      setRedirectToReferer(`/vacation_periods/?user_id=${period.user_id}`);
    }).catch((results) => {
      setErrors(translateErrors('vacation_period', results.errors));
    });
  }

  function onVacationPeriodChange(e) {
    const { name } = e.target;
    const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
    setPeriod({
      ...period,
      [name]: value,
    });
    if (name === 'vacation_days') { setErrors({}); }
  }

  function cancelUrl() {
    return `/vacation_periods?user_id=${period.user_id}`;
  }

  if (redirectToReferer) {
    return (
      <Redirect to={redirectToReferer} />
    );
  } if (!periodId || periodId === period.id) {
    return (
      <div className="container-fluid">
        <Helmet>
          <title>{I18n.t('apps.vacation_periods.edit')}</title>
        </Helmet>
        <div id="content" className="edit-vacation-period col-md-6">
          <VacationPeriodFields
            period={period}
            onVacationPeriodChange={onVacationPeriodChange}
            errors={errors}
          />
          <div className="form-actions text-right btn-group">
            <NavLink activeClassName="" className="btn btn-secondary" to={cancelUrl()}>
              <i className="fa fa-undo mr-2" />
              {I18n.t('common.cancel')}
            </NavLink>
            <button onClick={onSubmit} className="btn btn-success" type="button">
              <i className="fa fa-calendar-check-o mr-2" />
              {I18n.t('common.save')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Preloader rowsNumber={3} />
  );
}

export default EditVacationPeriod;
