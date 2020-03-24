import React from 'react';
import PropTypes from 'prop-types';

class UsersList extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeUser = this.onChangeUser.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  onChangeUser(e) {
    this.props.onChangeUser(e);
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === 'Spacebar') {
      this.onChangeUser(event);
    }
  }

  render() {
    return (
      <div className="menu transition visible" tabIndex="-1" style={{ display: 'block !important' }}>
        { this.props.users.map((user) => (
          <div key={user.id} data-value={user.id} tabIndex="0" className="item" onClick={this.onChangeUser} onKeyPress={this.handleKeyPress}>
            <div className="circular empty label ui" style={{ background: `#${user.color}` }} />
            {user.id === this.props.currentUser.id ? (
              <b>
                {`${user.first_name} ${user.last_name}`}
              </b>
            ) : `${user.first_name} ${user.last_name}`}
          </div>
        )) }
      </div>
    );
  }
}

UsersList.propTypes = {
  users: PropTypes.array,
  currentUser: PropTypes.object,
};

export default UsersList;
