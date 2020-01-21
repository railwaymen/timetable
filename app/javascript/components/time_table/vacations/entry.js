import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import _ from 'lodash';
import URI from 'urijs';
import { defaultDatePickerProps } from '../../shared/helpers';
import * as Api from '../../shared/api';
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
    vacationType: PropTypes.string,
  }

  state = {
    description: undefined,
    startDate: moment().format('DD/MM/YYYY'),
    endDate: moment().format('DD/MM/YYYY'),
    vacationType: 'planned',
    errors: [],
  }

  onDateChange(name, e) {
    this.setState({
      [name]: e.format('DD/MM/YYYY'),
    }, () => { this.removeErrorsFor(name); });
  }

  onSelectChange(e) {
    this.setState({
      vacationType: e.target.value,
    }, () => { this.removeErrorsFor('vacationType'); });
  }

  onChange(e) {
    this.setState({
      description: e.target.value,
    }, () => { this.removeErrorsFor('description'); });
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
      delete errors.base;
      return { errors };
    });
  }

  validate() {
    const {
      description, startDate, endDate, vacationType,
    } = this.state;

    const errors = {
      description: (vacationType === 'others' ? Validations.presence(description) : undefined),
      startDate: Validations.presence(startDate),
      endDate: Validations.presence(endDate),
      vacationType: Validations.presence(vacationType),
    };
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
        description, startDate, endDate, vacationType,
      } = this.state;

      const entryData = {
        user_id: userId,
        description,
        start_date: startDate,
        end_date: endDate,
        vacation_type: vacationType,
      };

      Api.makePostRequest({
        url: '/api/vacations',
        body: { vacation: entryData },
      }).then((response) => {
        const data = _.castArray(response.data);
        if (!data[0].id) {
          throw new Error('Invalid response');
        }
        this.props.updateVacationList();
        const newState = {
          description: '',
          vacationType: 'planned',
          startDate: moment().format('DD/MM/YYYY'),
          endDate: moment().format('DD/MM/YYYY'),
        };
        this.setState(newState);
        $('.vacation-type select')[0].value = 'planned';
      }).catch((e) => {
        if (e.errors && (e.errors.base || e.errors.start_date || e.errors.end_date || e.errors.description || e.errors.vacation_type)) {
          const newErrors = {};
          if (e.errors.start_date) newErrors.startDate = e.errors.start_date;
          if (e.errors.end_date) newErrors.endDate = e.errors.end_date;
          if (e.errors.description) newErrors.description = e.errors.description;
          if (e.errors.vacation_type) newErrors.vacationType = e.errors.vacation_type;
          if (e.errors.base) newErrors.base = e.errors.base;
          this.setState({ errors: newErrors });
        } else {
          alert(I18n.t('activerecord.errors.models.vacation.basic'));
        }
      });
    }
  }

  renderVacationTypes(vacationType) {
    return (
      <select className="form-control" value={vacationType} onChange={this.onSelectChange}>
        <option value="planned">{I18n.t('common.planned')}</option>
        <option value="requested">{I18n.t('common.requested')}</option>
        <option value="compassionate">{I18n.t('common.compassionate')}</option>
        <option value="others">{I18n.t('common.others')}</option>
      </select>
    );
  }

  renderErrorTooltip(errors) {
    return (
      <div className="error-tooltip vacation-errors">
        <ul>
          {errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const {
      startDate, endDate, description, vacationType, errors,
    } = this.state;

    return (
      <div>
        <div className="row vacation-date-range">
          <div className="date">
            {errors.startDate ? this.renderErrorTooltip(errors.startDate) : null}
            <DatePicker {...defaultDatePickerProps} name="start_date" className="form-control" selected={moment(startDate, 'DD/MM/YYYY')} value={moment(startDate, 'DD/MM/YYYY').format('DD/MM/YYYY')} format="DD/MM/YYYYs" dateFormat="DD/MM/YYYY" onChange={e => this.onDateChange('startDate', e)} onSelect={e => this.onDateChange('startDate', e)} />
          </div>
          <div className="date">
            {errors.endDate ? this.renderErrorTooltip(errors.endDate) : null}
            <DatePicker {...defaultDatePickerProps} name="end_date" className="form-control" selected={moment(endDate, 'DD/MM/YYYY')} value={moment(endDate, 'DD/MM/YYYY').format('DD/MM/YYYY')} format="DD/MM/YYYYs" dateFormat="DD/MM/YYYY" onChange={e => this.onDateChange('endDate', e)} onSelect={e => this.onDateChange('endDate', e)} />
          </div>
          <div className="vacation-type">
            {errors.vacationType ? this.renderErrorTooltip(errors.vacationType) : null}
            {this.renderVacationTypes(vacationType)}
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
    );
  }
}

export default Entry;
