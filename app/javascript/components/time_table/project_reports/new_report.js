import React from 'react';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import bindAll from 'lodash/bindAll';
import translateErrors from '@components/shared/translate_errors';
import ErrorTooltip from '@components/shared/error_tooltip';
import * as Api from '../../shared/api';
import DateRangeFilter from '../../shared/date_range_filter';
import Preloader from '../../shared/preloader';

export default class NewReport extends React.Component {
  // eslint-disable-next-line react/sort-comp
  static roles = ['developer', 'qa', 'ux', 'pm', 'ignored'];

  constructor(props) {
    super(props);

    bindAll(this, ['onRangeStartChange', 'onRangeEndChange', 'getRoles', 'onSubmit', 'onFieldChange', 'checkForCollision']);

    this.state = {
      projectId: parseInt(this.props.match.params.projectId, 10),
      startsAt: moment().startOf('month'),
      endsAt: moment().endOf('month'),
      userRoles: [],
      currency: '',
      name: '',
      collisions: [],
      redirectTo: null,
      sync: false,
      errors: {},
    };
  }

  componentDidMount() {
    this.getRoles();
  }

  onRangeStartChange(time) {
    const startsAt = moment(time);
    this.setState({ startsAt });
  }

  onRangeEndChange(time) {
    const endsAt = moment(time);
    this.setState({ endsAt });
  }

  getRoles() {
    this.setState({ sync: true });
    const { projectId, startsAt, endsAt } = this.state;
    const url = `/api/projects/${projectId}/project_reports/roles?starts_at=${startsAt.toISOString()}&ends_at=${endsAt.toISOString()}`;
    Api.makeGetRequest({ url })
      .then(({ data }) => {
        this.setState(({ currency }) => ({ sync: false, userRoles: data.user_roles, currency: currency || data.currency }));
      });
    this.checkForCollision();
  }

  checkForCollision() {
    const { projectId, startsAt, endsAt } = this.state;
    const url = `/api/projects/${projectId}/project_reports?starts_at=${startsAt.toISOString()}&ends_at=${endsAt.toISOString()}`;
    Api.makeGetRequest({ url })
      .then(({ data }) => this.setState({ collisions: data }));
  }

  onFieldChange(event, field, userId) {
    const { value } = event.target;
    this.setState(({ userRoles }) => {
      const newUserRoles = userRoles.map((userRole) => {
        if (userRole.id === userId) return { ...userRole, [field]: value };
        return { ...userRole };
      });
      return { userRoles: newUserRoles };
    });
  }

  onSubmit() {
    const {
      projectId, userRoles, startsAt, endsAt, currency, name,
    } = this.state;
    Api.makePostRequest({
      url: `/api/projects/${projectId}/project_reports`,
      body: {
        project_report_roles: userRoles,
        starts_at: startsAt,
        ends_at: endsAt,
        currency,
        name,
      },
    }).then(({ data }) => {
      this.setState({
        redirectTo: {
          pathname: `/projects/${projectId}/edit_report/${data.id}`,
          state: { report: data },
        },
      });
    }).catch((results) => {
      if (results.errors) {
        const errors = translateErrors('project_report', results.errors);
        this.setState({ errors });
      } else {
        alert('Failed to create report');
      }
    });
  }

  collisionAlert() {
    const { collisions } = this.state;
    if (collisions.length === 0) return null;
    return (
      <div className="alert alert-danger text-center" style={{ marginTop: '10px' }} role="alert">
        <strong>
          {I18n.t('apps.reports.collision')}
          :
          {collisions.map(({ name }) => name).join(', ')}
          .
        </strong>
      </div>
    );
  }

  render() {
    if (this.state.redirectTo) return <Redirect to={this.state.redirectTo} />;
    return (
      <div className="new-project-report">
        <Helmet>
          <title>{I18n.t('apps.reports.new')}</title>
        </Helmet>
        <div className="row">
          <div className="col-md-6 form-group">
            {this.state.errors.name && <ErrorTooltip errors={this.state.errors.name} />}
            <label>{I18n.t('common.name')}</label>
            <input className="form-control" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />
          </div>
          <div className="col-md-6 form-group">
            <label>{I18n.t('apps.reports.currency')}</label>
            <input className="form-control" value={this.state.currency} onChange={(e) => this.setState({ currency: e.target.value })} />
          </div>
        </div>
        <h1>{I18n.t('apps.reports.roles')}</h1>
        <DateRangeFilter
          from={this.state.startsAt.format()}
          to={this.state.endsAt.format()}
          onFromChange={this.onRangeStartChange}
          onToChange={this.onRangeEndChange}
          onFilter={this.getRoles}
          className="mb-3"
        />
        {this.collisionAlert()}
        <div className="table-responsive">
          {this.state.sync && <Preloader rowsNumber={1} />}
          <table className="table table-hover">
            <thead>
              <tr>
                <th>{I18n.t('apps.reports.owner')}</th>
                <th>{I18n.t('apps.reports.role')}</th>
                <th>{I18n.t('apps.reports.hourly_wage')}</th>
                <th>{I18n.t('common.description')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.userRoles.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.first_name}
                    {user.last_name}
                  </td>
                  <td>
                    <select className="form-control" value={user.role || ''} onChange={(e) => this.onFieldChange(e, 'role', user.id)}>
                      <option value="" />
                      {this.constructor.roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      value={user.hourly_wage}
                      onChange={(e) => this.onFieldChange(e, 'hourly_wage', user.id)}
                    />
                    {user.hourly_wage === '' && <span style={{ color: 'red', fontWeight: 'bold' }}>Invalid format</span>}
                  </td>
                  <td>
                    <input className="form-control" type="text" value={user.description} onChange={(e) => this.onFieldChange(e, 'description', user.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-actions text-right">
          <button className="btn btn-success btn-lg" type="button" onClick={this.onSubmit}>
            {I18n.t('common.submit')}
            <i className="ml-2 fa fa-paper-plane" />
          </button>
        </div>
      </div>
    );
  }
}
