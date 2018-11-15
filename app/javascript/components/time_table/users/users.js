import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import User from './user.js';
import { NavLink } from 'react-router-dom';

class Users extends React.Component {
  constructor (props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  componentDidMount () {
    this.getUsers();
  }

  static propTypes = {
    users: PropTypes.array
  }

  state = {
    users: [],
    visible: 'active'
  }

  getUsers () {
    fetch(`/api/users?filter=${this.state.visible}`)
      .then((response) => { return response.json(); })
      .then((data) => {
        this.setState({ users: data });
      })
  }

  onChange (e) {
    this.setState({
      [e.target.name]: [e.target.value]
    }, () => { this.getUsers() })
  }

  render () {
    const { users, visible } = this.state;

    return (
      <div>
        <div className="actions pull-left">
          <div className="disabled-button-wrapper" data-toggle="tooltip" data-placement="right" title="button_disabled_tooltip">
            <NavLink className="btn btn-default" to="/users/new">{I18n.t('common.add')}</NavLink>
          </div>
        </div>
        <div className="pull-left">
          <select name="visible" id="filter" className="form-control" onChange={this.onChange} defaultSelected={visible}>
            <option value="active">{I18n.t('apps.users.active')}</option>
            <option value="inactive">{I18n.t('apps.users.inactive')}</option>
            <option value="all">{I18n.t('apps.users.all')}</option>
          </select>
        </div>
        <table className="table table-striped">
          <thead>
            <th></th>
            <th>{I18n.t('apps.users.last_name')}</th>
            <th>{I18n.t('apps.users.first_name')}</th>
            <th>Email</th>
            <th>{I18n.t('apps.users.contract_id')}</th>
            <th>{I18n.t('apps.users.phone')}</th>
          </thead>
          <tbody>
            { users.map((user, i) =>
              <User key={i + '/' + user.id} user={user} />
            ) }
          </tbody>
        </table>
      </div>
    )
  }
}

export default Users;
