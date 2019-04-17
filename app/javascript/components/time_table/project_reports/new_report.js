import React from 'react';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import bindAll from 'lodash/bindAll';
import * as Api from '../../shared/api';
import DateRangeFilter from '../../shared/date_range_filter';

export default class NewReport extends React.Component {
  static roles = ['developer', 'qa', 'ux', 'pm'];

  state = {
    projectId: parseInt(this.props.match.params.projectId, 10),
    rangeStart: moment().startOf('month'),
    rangeEnd: moment().endOf('month'),
    userRoles: [],
    redirectTo: null,
  }

  constructor(props) {
    super(props);
    bindAll(this, ['onRangeStartChange', 'onRangeEndChange', 'getRoles', 'onRoleChange', 'onSubmit']);
  }

  componentDidMount() {
    this.getRoles();
  }

  onRangeStartChange(time) {
    const rangeStart = moment(time);
    this.setState({ rangeStart });
  }

  onRangeEndChange(time) {
    const rangeEnd = moment(time);
    this.setState({ rangeEnd });
  }

  getRoles() {
    Api.makeGetRequest({ url: `/api/projects/${this.state.projectId}/project_reports/roles?range_start=${this.state.rangeStart.toISOString()}&range_end=${this.state.rangeEnd.toISOString()}` })
      .then(({ data }) => {
        this.setState({ userRoles: data });
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

  onSubmit() {
    const {
      projectId, userRoles, rangeStart, rangeEnd,
    } = this.state;
    Api.makePostRequest({
      url: `/api/projects/${projectId}/project_reports`,
      body: {
        project_report_roles: userRoles,
        range_start: rangeStart,
        range_end: rangeEnd,
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
        <h1>Roles</h1>
        <DateRangeFilter from={this.state.rangeStart.format()} to={this.state.rangeEnd.format()} onFromChange={this.onRangeStartChange} onToChange={this.onRangeEndChange} onFilter={this.getRoles} />
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Last name</th>
              <th>Role</th>
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
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={this.onSubmit}>Submit</button>
      </div>
    );
  }
}
