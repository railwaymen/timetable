import React, { useState, useEffect } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import useFormHandler from '@hooks/use_form_handler';
import { defaultDatePickerProps } from '@components/shared/helpers';
import ErrorTooltip from '@components/shared/error_tooltip';
import translateErrors from '@components/shared/translate_errors';
import { makeGetRequest, makePostRequest, makePutRequest } from '../../shared/api';

const EditMilestone = () => {
  const history = useHistory();
  const { projectId, id } = useParams();
  const editableEstimateTypes = ['dev', 'qa', 'ux', 'pm', 'other'];
  const calculableEstimateTypes = editableEstimateTypes.concat('external');
  const milestoneDefaults = {
    dev_estimate: 0,
    dev_estimate_hours: 0,
    qa_estimate: 0,
    qa_estimate_hours: 0,
    ux_estimate: 0,
    ux_estimate_hours: 0,
    pm_estimate: 0,
    pm_estimate_hours: 0,
    other_estimate: 0,
    other_estimate_hours: 0,
    external_estimate: 0,
    total_estimate: 0,
    closed: false,
    visible_on_reports: false,
  };
  const [milestone, setMilestone, onChange] = useFormHandler(milestoneDefaults);
  const [errors, setErrors] = useState({});

  function onDateChange(date, name) {
    const value = date ? date.format('YYYY-MM-DD') : null;
    setMilestone({ ...milestone, [name]: value });
  }

  function calculateHours(valueInSeconds) {
    return valueInSeconds === 0 ? 0 : Math.round(valueInSeconds / 3600);
  }

  function calculateMinutes(valueInSeconds) {
    return valueInSeconds === 0 ? 0 : (valueInSeconds % 3600) / 60;
  }

  function onEstimateChange(event) {
    const {
      target: {
        name,
        value,
      },
    } = event;

    setMilestone({ ...milestone, [`${name}_estimate_hours`]: parseInt(value || 0, 10), [`${name}_estimate`]: parseInt(value || 0, 10) * 3600 });
  }

  function performCreate() {
    makePostRequest({ url: `/api/projects/${projectId}/milestones`, body: milestone })
      .then(() => {
        setErrors({});
        history.push(`/projects/${projectId}/milestones`);
      }).catch((response) => {
        setErrors(translateErrors('milestone', response.errors));
      });
  }

  function performUpdate() {
    makePutRequest({ url: `/api/projects/${projectId}/milestones/${id}`, body: milestone })
      .then(() => {
        setErrors({});
        history.push(`/projects/${projectId}/milestones`);
      }).catch((response) => {
        setErrors(translateErrors('milestone', response.errors));
      });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (id) {
      performUpdate();
    } else {
      performCreate();
    }
  }

  function calculateEditableHours(fields) {
    return calculableEstimateTypes.reduce((map, type) => {
      const valueInSeconds = fields[`${type}_estimate`];
      map[`${type}_estimate_hours`] = valueInSeconds === 0 ? 0 : Math.round(valueInSeconds / 3600);
      return map;
    }, {});
  }

  function getMilestone() {
    makeGetRequest({ url: `/api/projects/${projectId}/milestones/${id}` })
      .then((response) => {
        setMilestone({ ...response.data, ...calculateEditableHours(response.data), isExternal: response.data.external_id != null });
      });
  }

  function renderEditableEstimates() {
    return editableEstimateTypes.map((type) => (
      <div key={type} className="col-2">
        <label>{I18n.t(type, { scope: 'apps.department' })}</label>
        <div className="input-group">
          <input
            type="number"
            min="0"
            className="form-control"
            name={type}
            onChange={onEstimateChange}
            value={milestone[`${type}_estimate_hours`]}
          />
          <div className="input-group-append">
            <span className="input-group-text">H</span>
          </div>
        </div>
      </div>
    ));
  }

  const totalEstimate = editableEstimateTypes.map((type) => parseInt(milestone[`${type}_estimate`], 10))
    .reduce((a, b) => a + b) + parseInt(milestone.external_estimate, 10);

  useEffect(() => {
    if (id) getMilestone();
  }, []);

  return (
    <div id="content">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          {errors.name && <div className="error-description">{errors.name.join(', ')}</div>}
          <input
            type="text"
            className={`${errors.name ? 'error' : ''} form-control`}
            name="name"
            disabled={milestone.isExternal}
            placeholder={I18n.t('common.name')}
            onChange={onChange}
            value={milestone.name || ''}
          />
        </div>
        <div className="row">
          <div className="col form-group">
            {errors.startsOn && <ErrorTooltip errors={errors.startsOn} />}
            <DatePicker
              {...defaultDatePickerProps}
              dateFormat="YYYY-MM-DD"
              disabled={milestone.isExternal}
              className={`${errors.startsOn ? 'error' : ''} form-control`}
              selected={milestone.starts_on ? moment(milestone.starts_on, 'YYYY-MM-DD') : null}
              value={milestone.starts_on}
              name="starts_on"
              placeholderText={I18n.t('common.from')}
              onChange={(date) => onDateChange(date, 'starts_on')}
            />
          </div>
          <div className="col form-group">
            {errors.endsOn && <ErrorTooltip errors={errors.endsOn} />}
            <DatePicker
              {...defaultDatePickerProps}
              dateFormat="YYYY-MM-DD"
              disabled={milestone.isExternal}
              className={`${errors.endsOn ? 'error' : ''} form-control`}
              selected={milestone.ends_on ? moment(milestone.ends_on, 'YYYY-MM-DD') : null}
              value={milestone.ends_on}
              name="ends_on"
              placeholderText={I18n.t('common.to')}
              onChange={(date) => onDateChange(date, 'ends_on')}
            />
          </div>
          <div className="col form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="visible_on_reports"
              checked={milestone.visible_on_reports}
              onChange={onChange}
              id="visible_on_reports"
            />
            <label className="form-check-label" htmlFor="visible_on_reports">
              {I18n.t('apps.milestones.visible_on_reports')}
            </label>
          </div>
          <div className="col form-check">
            <input className="form-check-input" type="checkbox" name="closed" checked={milestone.closed} onChange={onChange} id="milestone-closed" />
            <label className="form-check-label" htmlFor="milestone-closed">
              {I18n.t('apps.milestones.milestone_closed')}
            </label>
          </div>
        </div>
        <div className="form-group">
          <textarea
            className="form-control"
            name="note"
            placeholder={I18n.t('apps.accounting_periods.note')}
            onChange={onChange}
            value={milestone.note || ''}
          />
        </div>

        <div className="form-group row">
          {renderEditableEstimates()}
        </div>

        <div className="form-group">
          <textarea
            className="form-control"
            name="estimate_change_note"
            placeholder={I18n.t('apps.milestones.estimate_change_note')}
            onChange={onChange}
            value={milestone.estimate_change_note || ''}
          />
        </div>

        <div className="form-group row">
          <div className="col-2">
            <label>JIRA</label>
            <div className="row no-gutters">
              <div className="col input-group">
                <input
                  type="number"
                  className="form-control"
                  disabled="disabled"
                  value={calculateHours(milestone.external_estimate)}
                />
                <div className="input-group-append">
                  <span className="input-group-text">H</span>
                </div>
              </div>
              <div className="col input-group">
                <input
                  type="number"
                  className="form-control"
                  disabled="disabled"
                  value={calculateMinutes(milestone.external_estimate)}
                />
                <div className="input-group-append">
                  <span className="input-group-text">M</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-2">
            <label>{I18n.t('common.total')}</label>
            <div className="row no-gutters">
              <div className="col input-group">
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  disabled="disabled"
                  value={calculateHours(totalEstimate)}
                />
                <div className="input-group-append">
                  <span className="input-group-text">H</span>
                </div>
              </div>
              <div className="col input-group">
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  disabled="disabled"
                  value={calculateMinutes(totalEstimate)}
                />
                <div className="input-group-append">
                  <span className="input-group-text">M</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="btn-group">
          <NavLink className="btn btn-secondary" to={`/projects/${projectId}/milestones`}>{I18n.t('common.cancel')}</NavLink>
          <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} />
        </div>
      </form>
    </div>
  );
};

export default EditMilestone;
