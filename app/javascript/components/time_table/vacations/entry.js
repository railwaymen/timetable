import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { defaultDatePickerProps } from '../../shared/helpers';
import * as Api from '../../shared/api';
import ErrorTooltip from '../timesheet/errors/error_tooltip';
import _ from 'lodash';
import * as Validations from '../../shared/validations';

class Entry extends React.Component {
  constructor(props) {
    super(props);

    this.onDateChange = this.onDateChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.validate = this.validate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  static propTypes = {
    decription: PropTypes.string,
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    vacation_type: PropTypes.string,
  }

  state = {
    description: undefined,
    startDate: moment().format('DD/MM/YYYY'),
    endDate: moment().format('DD/MM/YYYY'),
    vacation_type: 'planned',
    errors: []
  }

  onDateChange(name, e) {
    this.setState({
      [name]: e.format('DD/MM/YYYY')
    }, () => { this.removeErrorsFor(name); })
  }

  onSelectChange(e) {
    this.setState({
      vacation_type: e.target.value
    }, () => { this.removeErrorsFor('vacation_type'); })
  }

  onChange(e) {
    this.setState({
      description: e.target.value
    }, () => { this.removeErrorsFor('description'); })
  }

  onKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.onSubmit();
    }
  }

  removeErrorsFor(name) {
    this.setState(({ errors }) => {
      delete errors[name];
      delete errors['base'];
      return { errors };
    });
  }

  validate() {
    const {
      description, startDate, endDate, vacation_type
    } = this.state;

    const errors = {
      description: (vacation_type === 'others' ? Validations.presence(description) : undefined),
      startDate: Validations.presence(startDate),
      endDate: Validations.presence(endDate),
      vacation_type: Validations.presence(vacation_type)
    }
    Object.keys(errors).forEach((key) => { if (errors[key] === undefined) { delete errors[key]; } });
    return errors;
  }

  onSubmit() {
    const errors = this.validate();
    const userId = URI(window.location.href).search(true).user_id || currentUser.id;

    if (!_.isEmpty(errors)) {
      this.setState({ errors });
    } else {
      const {
        description, startDate, endDate, vacation_type
      } = this.state;

      const entryData = {
        user_id: userId,
        description: description,
        start_date: startDate,
        end_date: endDate,
        vacation_type: vacation_type
      };

      Api.makePostRequest({
        url: '/api/vacations',
        body: { vacation: entryData },
      }).then((response) => {
        const data = _.castArray(response.data);
        if (!data[0].id) {
          throw new Error('Invalid response');
        }
        data.forEach(this.props.updateVacationList);
        const newState = {
          description: '',
          vacation_type: 'planned',
          startDate: moment().format('DD/MM/YYYY'),
          endDate: moment().format('DD/MM/YYYY')
        };
        this.setState(newState);
        $('.vacation-type select')[0].value = 'planned';
      }).catch((e) => {
        if (e.errors && (e.errors.base || e.errors.start_date || e.errors.end_date || e.errors.description || e.errors.vacation_type)) {
          const newErrors = {};
          if (e.errors.start_date) newErrors.startDate = e.errors.start_date;
          if (e.errors.end_date) newErrors.endDate = e.errors.end_date;
          if (e.errors.description) newErrors.description = e.errors.description;
          if (e.errors.vacation_type) newErrors.vacation_type = e.errors.vacation_type;
          if (e.errors.base) newErrors.base = e.errors.base;
          this.setState({ errors: newErrors });
        } else {
          alert(I18n.t('activerecord.errors.models.vacation.basic'));
        }
      });
    }
  }

  renderVacationTypes(vacation_type) {
    return(
      <select className="form-control" value={vacation_type} onChange={this.onSelectChange}>
        <option value="planned">{I18n.t('common.planned')}</option>
        <option value="requested">{I18n.t('common.requested')}</option>
        <option value="compassionate">{I18n.t('common.compassionate')}</option>
        <option value="others">{I18n.t('common.others')}</option>
      </select>
    )
  }

  renderErrorTooltip(errors) {
    return(
      <div className="error-tooltip vacation-errors">
        <ul>
          {errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    )
  }

  render() {
    const { startDate, endDate, description, vacation_type, errors } = this.state

    return (
      <div>
        <div className="row vacation-date-range">
          <div className="date">
            {errors.startDate ? this.renderErrorTooltip(errors.startDate) : null}
            <DatePicker {...defaultDatePickerProps} name="start_date" className="form-control" selected={moment(startDate, 'DD/MM/YYYY')} value={moment(startDate, 'DD/MM/YYYY').format('DD/MM/YYYY')} format="DD/MM/YYYYs" dateFormat="DD/MM/YYYY" onChange={this.onDateChange.bind(this, 'startDate')} onSelect={this.onDateChange.bind(this, 'startDate')} />
          </div>
          <div className="date">
            {errors.endDate ? this.renderErrorTooltip(errors.endDate) : null}
            <DatePicker {...defaultDatePickerProps} name="end_date" className="form-control" selected={moment(endDate, 'DD/MM/YYYY')} value={moment(endDate, 'DD/MM/YYYY').format('DD/MM/YYYY')} format="DD/MM/YYYYs" dateFormat="DD/MM/YYYY" onChange={this.onDateChange.bind(this, 'endDate')} onSelect={this.onDateChange.bind(this, 'endDate')} />
          </div>
          <div className="vacation-type">
            {errors.vacation_type ? this.renderErrorTooltip(errors.vacation_type) : null}
            {this.renderVacationTypes(vacation_type)}
          </div>
        </div>
        <div className="row description-containter">
          <div className="description">
            {errors.description ? this.renderErrorTooltip(errors.description) : null}
            <textarea className="form-control" placeholder={I18n.t('apps.vacations.vacation_description')} name="description" value={description} onChange={this.onChange} onKeyPress={this.onKeyPress} />
          </div>
        </div>
        <div className="row">
          <div className="base-error">
            {errors.base ? this.renderErrorTooltip(errors.base) : null}
          </div>
        </div>
        <div className="row buttons">
          <div className="form-actions">
            <button type="button" className="bt-vacation" onClick={(this.onSubmit)}>
              <span className="bt-txt">{I18n.t('common.send')}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Entry;