import React from 'react';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
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
    bindAll(this, ['onRangeStartChange', 'onRangeEndChange', 'getRoles', 'onRoleChange', 'onSubmit', 'onWageChange']);
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
    Api.makeGetRequest({ url: `/api/projects/${this.state.projectId}/project_reports/roles?starts_at=${this.state.startsAt.toISOString()}&ends_at=${this.state.endsAt.toISOString()}` })
      .then(({ data }) => {
        this.setState({ userRoles: data.user_roles, currency: data.currency || this.state.currency });
      });
  }

  onRoleChange(event, userId) {
    const { value } = event.target;
    this.setState(({ userRoles }) => {
      const idxInArray = userRoles.findIndex(({ id }) => id === userId);
      userRoles[idxInArray].role = value;
      return { userRoles };
    });
  }

  onWageChange(event, userId) {
    const { value } = event.target;
    this.setState(({ userRoles }) => {
      const idxInArray = userRoles.findIndex(({ id }) => id === userId);
      userRoles[idxInArray].hourly_wage = value;
      return { userRoles };
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
    });
  }

  render() {
    if (this.state.redirectTo) return <Redirect to={this.state.redirectTo} />;
    return (
      <div>
        <h2>
          Name
        </h2>
        <input value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
        <h2>
          Currency
        </h2>
        <input value={this.state.currency} onChange={e => this.setState({ currency: e.target.value })} />
        <h1>Roles</h1>
        <DateRangeFilter from={this.state.startsAt.format()} to={this.state.endsAt.format()} onFromChange={this.onRangeStartChange} onToChange={this.onRangeEndChange} onFilter={this.getRoles} />
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Last name</th>
              <th>Role</th>
              <th>Hourly wage</th>
            </tr>
          </thead>
          <tbody>
            {this.state.userRoles.map(user => (
              <tr key={user.id}>
                <td>
                  {user.first_name}
                </td>
                <td>
                  {user.last_name}
                </td>
                <td>
                  <select value={user.role || ''} onChange={e => this.onRoleChange(e, user.id)}>
                    <option value="" />
                    {this.constructor.roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="number" min="0" step="0.01" value={user.hourly_wage} onChange={e => this.onWageChange(e, user.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <button type="button" onClick={this.onSubmit}>Submit</button>
      </div>
    );
  }
}
