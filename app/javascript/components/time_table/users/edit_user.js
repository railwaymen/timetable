import React from 'react';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api.js';
import { NavLink, Redirect } from 'react-router-dom';

class EditUser extends React.Component {
  constructor (props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.getUser  = this.getUser.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this._renderAdminFields = this._renderAdminFields.bind(this);
    this._renderUserFields = this._renderUserFields.bind(this);
  }

  componentDidMount () {
    this.getUser();
  }

  getUser () {
    if (this.state.userId) {
      Api.makeGetRequest({ url: `/api/users/${this.state.userId}` })
         .then((response) => {
           this.setState({ user: response.data });
         })
     }
  }

  static propTypes = {
    user: PropTypes.object
  }

  state = {
    user: {},
    redirectToReferer: undefined,
    userId: window.location.pathname.match(/[0-9]+/)
  }

  onChange (e) {
    this.setState({
      user: {
        ...this.state.user,
        [e.target.name]: e.target.value
      }
    })
  }

  onCheckboxChange (e) {
    this.setState({
      user: {
        ...this.state.user,
        [e.target.name]: !this.state.user[e.target.name]
      }
    })
  }

  onSubmit (e) {
    e.preventDefault();
    this.saveUser();
  }

  saveUser () {
    let user = this.state.user;

    if (this.state.userId) {
      Api.makePutRequest({ url: `/api/users/${user.id}`, body: { id: user.id, user: user } })
         .then(() => {
           this.setState({ redirectToReferer: (currentUser.admin ? '/users' : '/projects') }, () => {
             window.currentUser = { ...currentUser, ...user };
           })
         })
    } else {
      Api.makePostRequest({ url: `/api/users`, body: { user: user } })
         .then(() => {
           this.setState({ redirectToReferer: '/users' })
         })
    }
  }

  _renderAdminFields (user) {
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
          <input className="form-control" type="text" name="contract_name" placeholder={I18n.t('apps.users.contract_id')} value={user.contract_id} onChange={this.onChange} />
        </div>
        <div className="form-group">
          <input className="form-control" type="text" name="phone" placeholder={I18n.t('apps.users.phone')} value={user.phone} onChange={this.onChange} />
        </div>
        { user.id !== currentUser.id ?
          <div className="form-group">
            <label>
              {I18n.t('apps.users.user_active')}
              <input type="checkbox" name="active" checked={user.active} onChange={this.onCheckboxChange} />
            </label>
          </div> : null }
        <div className="form-group">
          <select className="form-control" name="lang" onChange={this.onChange} value={user.lang}>
            <option value="pl">pl</option>
            <option value="en">en</option>
          </select>
        </div>
      </div>
    )
  }

  _renderUserFields (user) {
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
    )
  }

  render () {
    const { user, redirectToReferer } = this.state;

    if (redirectToReferer) return <Redirect to={redirectToReferer} />

    return (
      <form>
        {currentUser.admin ? this._renderAdminFields(user) : this._renderUserFields(user)}
        <input className="btn btn-default" type="submit" value={I18n.t('common.save')} onClick={this.onSubmit} />
        <NavLink className="btn btn-primary" to="/users">{I18n.t('common.cancel')}</NavLink>
      </form>
    )
  }
}

export default EditUser;
