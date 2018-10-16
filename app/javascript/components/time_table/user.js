import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class User extends React.Component {
  render () {
    const user = this.props.user;

    return (
      <tr>
        <td></td>
        <td>{user.first_name}</td>
        <td>{user.last_name}</td>
        <td>{user.email}</td>
        <td>{user.contract_id}</td>
        <td>{user.phone}</td>
      </tr>
    )
  }
}

export default User;
