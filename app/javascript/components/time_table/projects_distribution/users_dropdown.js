/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import UsersList from './users_list';

class UsersDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.hideDropdown = this.hideDropdown.bind(this);
    this.expandDropdown = this.expandDropdown.bind(this);
    this.renderUsersList = this.renderUsersList.bind(this);
    this.onChangeUser = this.onChangeUser.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.searchRef = React.createRef();
    this.state = {
      isExpanded: false,
      filter: '',
      filteredUsers: this.filterUsers(''),
    };
  }

  componentDidMount() {
    this.setState({
      filteredUsers: this.filterUsers(),
    });
  }

  onFilterChange(e) {
    this.setState({
      filter: e.target.value,
      filteredUsers: this.filterUsers(e.target.value),
    });
  }

  onKeyPress(e) {
    const { filteredUsers } = this.state;
    if (e.key === 'Enter' && filteredUsers.length > 0) {
      const users = this.filterUsers();
      const selectedUser = _.find(users, (p) => (
        p.id === filteredUsers[0]
      )) || users[0];

      this.props.updateUser(selectedUser);
      this.hideDropdown();
    }
  }

  filterUsers(filter = this.state.filter) {
    const lowerFilter = filter.toLowerCase();
    return _.filter(this.props.users, (p) => (
      p.active && (`${p.first_name} ${p.last_name}`.toLowerCase().match(lowerFilter) || `${p.last_name} ${p.first_name}`.toLowerCase().match(lowerFilter))
    ));
  }

  hideDropdown(e) {
    if (e && e.target === this.searchRef.current) return; // Do not hide when click is on search input
    document.removeEventListener('click', this.hideDropdown);
    this.setState({ isExpanded: false, filter: '', filteredUsers: this.filterUsers('') });
  }

  expandDropdown() {
    this.setState({ isExpanded: true, filter: '', filteredUsers: this.filterUsers('') }, () => {
      document.addEventListener('click', this.hideDropdown);
    });
  }

  onBlur() {
    this.setState({ isExpanded: false });
  }

  onChangeUser(e) {
    const userId = parseInt(e.target.attributes.getNamedItem('data-value').value, 10);

    if (userId !== this.props.selectedUser) {
      const users = this.filterUsers('');
      const selectedUser = _.find(users, (p) => (
        p.id === userId
      )) || users[0];

      this.hideDropdown();
      this.props.updateUser(selectedUser);
    }
  }

  renderUsersList() {
    return (
      <div style={{ marginTop: '15px' }}>
        <UsersList users={this.state.filteredUsers} currentUser={this.props.selectedUser} onChangeUser={this.onChangeUser} />
      </div>
    );
  }

  render() {
    const { isExpanded, filter } = this.state;
    const { selectedUser } = this.props;

    return (
      <div className="dropdown fluid search ui" style={{ minWidth: '90px' }}>
        <input type="hidden" name="user" value="12" />
        <input
          placeholder="User"
          onFocus={this.expandDropdown}
          ref={this.searchRef}
          className="form-control input-search"
          name="filter"
          value={filter}
          autoComplete="off"
          tabIndex="0"
          onChange={this.onFilterChange}
          id="search-input"
          onKeyPress={this.onKeyPress}
        />
        <div className={`text active ${(isExpanded ? 'hidden' : '')}`} style={{ background: `#${selectedUser.color}` }} onClick={this.expandDropdown}>
          <div>
            <div className="circular empty label ui" style={{ background: `#${selectedUser.color}` }} />
            {selectedUser.first_name}
          </div>
        </div>
        { isExpanded ? this.renderUsersList() : null }
      </div>
    );
  }
}

UsersDropdown.propTypes = {
  users: PropTypes.array,
  selectedUser: PropTypes.object,
  isExpanded: PropTypes.bool,
  filter: PropTypes.string,
};

export default UsersDropdown;
