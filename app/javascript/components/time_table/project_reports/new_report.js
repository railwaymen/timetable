import React from 'react';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import URI from 'urijs';
import bindAll from 'lodash/bindAll';
import * as Api from '../../shared/api';
import DateRangeFilter from '../../shared/date_range_filter';

export default class NewReport extends React.Component {
  static roles = ['developer', 'qa', 'ux', 'pm', 'ignored'];

  state = {
    projectId: parseInt(this.props.match.params.projectId, 10),
    startsAt: moment().startOf('month'),
    endsAt: moment().endOf('month'),
    userRoles: [],
    currency: '',
    name: '',
    redirectTo: null,
  }

  constructor(props) {
    super(props);
    bindAll(this, ['onRangeStartChange', 'onRangeEndChange', 'getRoles', 'onSubmit', 'onFieldChange']);
  }

  componentDidMount() {
    const base = URI(window.location.href);
    const { from, to } = base.query(true);
    if (from && to) {
      this.setState({ startsAt: moment(from), endsAt: moment(to) }, this.getRoles);
    } else {
      this.getRoles();
    }
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
    Api.makeGetRequest({ url: `/api/projects/${this.state.projectId}/project_reports/roles?starts_at=${this.state.startsAt.toISOString()}&ends_at=${this.state.endsAt.toISOString()}` })
      .then(({ data }) => {
        this.setState(({ currency }) => ({ userRoles: data.user_roles, currency: currency || data.currency }));
      });
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
    }).catch(() => {
      alert('Failed to create report');
    });
  }

  render() {
    if (this.state.redirectTo) return <Redirect to={this.state.redirectTo} />;
    return (
      <div className="new-project-report">
        <div className="form-group">
          <label>{I18n.t('common.name')}</label>
          <input className="form-control" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{I18n.t('apps.reports.currency')}</label>
          <input className="form-control" value={this.state.currency} onChange={e => this.setState({ currency: e.target.value })} />
        </div>        
        <h1>{I18n.t('apps.reports.roles')}</h1>
        <DateRangeFilter from={this.state.startsAt.format()} to={this.state.endsAt.format()} onFromChange={this.onRangeStartChange} onToChange={this.onRangeEndChange} onFilter={this.getRoles} />
        <div class="table-responsive">
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
              {this.state.userRoles.map(user => (
                <tr key={user.id}>
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>
                    <select className="form-control" value={user.role || ''} onChange={e => this.onFieldChange(e, 'role', user.id)}>
                      <option value="" />
                      {this.constructor.roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input className="form-control" type="number" min="0" step="0.01" value={user.hourly_wage} onChange={e => this.onFieldChange(e, 'hourly_wage', user.id)} />
                    {user.hourly_wage === '' && <span style={{ color: 'red', fontWeight: 'bold' }}>Invalid format</span>}
                  </td>
                  <td>
                    <input className="form-control" type="text" value={user.description} onChange={e => this.onFieldChange(e, 'description', user.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-actions text-right">
          <button className="bt bt-main bt-big" type="button" onClick={this.onSubmit}>
            <i className="symbol fa fa-paper-plane-o" />
            <span className="bt-txt">{I18n.t('common.submit')}</span>
          </button>
        </div>
      </div>
    );
  }
}
