import React from 'react';
import { Redirect, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Preloader from '../../shared/preloader';
import * as Api from '../../shared/api';

class EditVacationPeriod extends React.Component {
  constructor(props) {
    super(props);

    this.getPeriod = this.getPeriod.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);

    this.state = {
      period: {},
      periodId: parseInt(this.props.match.params.id, 10),
      redirectToReferer: undefined,
      errors: {},
    };
  }

  componentDidMount() {
    this.getPeriod({ periodId: this.state.periodId });
  }

  getPeriod(options) {
    Api.makeGetRequest({
      url: `/api/vacation_periods/${options.periodId}`,
    }).then((response) => {
      this.setState({
        period: response.data,
      });
    });
  }

  onSubmit() {
    const { period } = this.state;
    Api.makePutRequest({
      url: `/api/vacation_periods/${period.id}`,
      body: { vacation_period: { ...period } },
    }).then(() => {
      this.setState({
        redirectToReferer: `/vacation_periods/?user_id=${period.user_id}`,
      });
    }).catch((results) => {
      this.setState({
        errors: results.errors,
      });
    });
  }

  onChange(e) {
    const { name, value } = e.target;

    this.setState((prevState) => ({
      period: {
        ...prevState.period,
        [name]: value,
      },
    }));
  }

  onCheckboxChange(e) {
    const { name } = e.target;

    this.setState((prevState) => ({
      period: {
        ...prevState.period,
        [name]: !prevState.period[name],
      },
    }));
  }

  cancelUrl() {
    return `/vacation_periods?user_id=${this.state.period.user_id}`;
  }

  render() {
    const {
      period, periodId, redirectToReferer, errors,
    } = this.state;
    let result;

    if (redirectToReferer) return (<Redirect to={redirectToReferer} />);
    if (!periodId || periodId === period.id) {
      result = (
        <div className="container-fluid">
          <Helmet>
            <title>{I18n.t('apps.vacation_periods.edit')}</title>
          </Helmet>
          <div id="content" className="edit-vacation-period col-md-6">
            <form onSubmit={this.onSubmit}>
              { errors.vacation_days && (
                <div className="error-description">{errors.vacation_days.join(', ')}</div>
              )}
              <div className="form-group">
                <input
                  className={`${errors.vacation_days ? 'error' : ''} form-control`}
                  type="number"
                  name="vacation_days"
                  onChange={this.onChange}
                  value={period.vacation_days}
                  disabled={period.closed}
                />
              </div>
              { errors.note && (
                <div className="error-description">{errors.note.join(', ')}</div>
              )}
              <div className="form-group">
                <textarea
                  className={`${errors.note ? 'error' : ''} form-control`}
                  name="note"
                  placeholder={I18n.t('apps.vacation_periods.note')}
                  onChange={this.onChange}
                  value={period.note}
                  disabled={period.closed}
                />
              </div>
              <div className="form-group">
                <label className="form-check-label">
                  <input type="checkbox" name="closed" checked={period.closed} onChange={this.onCheckboxChange} />
                  <span className="checkbox" />
                  <span className="ch-txt">
                    {I18n.t('apps.vacation_periods.closed')}
                    <i className="symbol state-symbol fa fa-lock" />
                  </span>
                </label>
              </div>
            </form>
            <div className="form-actions text-right btn-group">
              <NavLink activeClassName="" className="btn btn-secondary" to={this.cancelUrl()}>
                <i className="fa fa-undo mr-2" />
                {I18n.t('common.cancel')}
              </NavLink>
              <button onClick={this.onSubmit} className="btn btn-success" type="button">
                <i className="fa fa-calendar-check-o mr-2" />
                {I18n.t('common.save')}
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      result = <Preloader rowsNumber={3} />;
    }

    return result;
  }
}

export default EditVacationPeriod;
