import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Redirect } from 'react-router-dom';
import * as Api from '../../shared/api';
import { unnullifyFields } from '../../shared/helpers';

class EditUser extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.getUser = this.getUser.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.renderAdminFields = this.renderAdminFields.bind(this);
    this.renderUserFields = this.renderUserFields.bind(this);
  }

  componentDidMount() {
    this.getUser();
  }

  getUser() {
    if (this.state.userId) {
      Api.makeGetRequest({ url: `/api/users/${this.state.userId}` })
        .then((response) => {
          const user = unnullifyFields(response.data);
          this.setState({ user });
        });
    }
  }

  static propTypes = {
    user: PropTypes.object,
  }

  state = {
    user: {},
    redirectToReferer: undefined,
    userId: parseInt(this.props.match.params.id, 10),
  }

  onChange(e) {
    this.setState({
      user: {
        ...this.state.user,
        [e.target.name]: e.target.value,
      },
    });
  }

  onCheckboxChange(e) {
    this.setState({
      user: {
        ...this.state.user,
        [e.target.name]: !this.state.user[e.target.name],
      },
    });
  }

  onSubmit(e) {
    e.preventDefault();
    this.saveUser();
  }

  saveUser() {
    const { user } = this.state;

    if (this.state.userId) {
      Api.makePutRequest({ url: `/api/users/${user.id}`, body: { id: user.id, user } })
        .then(() => {
          if (user.lang !== currentUser.lang) {
            window.location.href = currentUser.admin ? '/users' : '/projects';
          } else {
            this.setState({ redirectToReferer: (currentUser.admin ? '/users' : '/projects') });
          }

          if (currentUser.id === user.id) window.currentUser = { ...currentUser, ...user };
        });
    } else {
      Api.makePostRequest({ url: '/api/users', body: { user } })
        .then(() => {
          this.setState({ redirectToReferer: '/users' });
        });
    }
  }

  renderAdminFields(user) {
    return (
      <div>
        <div className="form-group">
          <input className="form-control" type="text" name="email" placeholder="Email" onChange={this.onChange} value={user.email} />
        </div>

        <div className="form-group">
          <input className="form-control" type="text" name="first_name" placeholder={I18n.t('apps.users.first_name')} onChange={this.onChange} value={user.first_name} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="last_name" placeholder={I18n.t('apps.users.last_name')} value={user.last_name} onChange={this.onChange} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="contract_name" placeholder={I18n.t('apps.users.contract_id')} value={user.contract_name} onChange={this.onChange} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="phone" placeholder={I18n.t('apps.users.phone')} value={user.phone} onChange={this.onChange} />
        </div>
        { user.id !== currentUser.id
          ? (
            <div className="form-group">
              <label>
                {I18n.t('apps.users.user_active')}
                <input type="checkbox" name="active" checked={user.active} onChange={this.onCheckboxChange} />
              </label>
            </div>
          ) : null }
        <div className="form-group">
          <select className="form-control" name="lang" onChange={this.onChange} value={user.lang}>
            <option value="pl">pl</option>
            <option value="en">en</option>
          </select>
        </div>
      </div>
    );
  }

  renderUserFields(user) {
    return (
      <div>
        <div className="form-group">
          <input className="form-control" type="text" name="first_name" placeholder={I18n.t('apps.users.first_name')} onChange={this.onChange} value={user.first_name} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="last_name" placeholder={I18n.t('apps.users.last_name')} value={user.last_name} onChange={this.onChange} />
        </div>
        <div className="form-group">
          <select className="form-control" name="lang" onChange={this.onChange} value={user.lang}>
            <option value="pl">pl</option>
            <option value="en">en</option>
          </select>
        </div>
      </div>
    );
  }

  renderPreloader() {
    return (
      <div>
        <div className="form-group">
          <div className="preloader" />
        </div>
        <div className="form-group">
          <div className="preloader" />
        </div>
        <div className="form-group">
          <div className="preloader" />
        </div>
        <div className="form-group">
          <div className="preloader" />
        </div>
        <div className="form-group">
          <div className="preloader" />
        </div>
      </div>
    );
  }

  renderFields() {
    const { user, userId } = this.state;
    if (user.id === userId || !userId) {
      return currentUser.admin ? this.renderAdminFields(user) : this.renderUserFields(user);
    }
    return this.renderPreloader();
  }

  render() {
    const { redirectToReferer } = this.state;

    if (redirectToReferer) return <Redirect to={redirectToReferer} />;

    return (
      <form>
        {this.renderFields()}
        <NavLink activeClassName="" className="btn btn-default" to="/users">{I18n.t('common.cancel')}</NavLink>
        <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={this.onSubmit} />
      </form>
    );
  }
}

export default EditUser;
