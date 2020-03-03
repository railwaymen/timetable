import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

function UserFields(props) {
  const { user, errors, onChange } = props;

  return (
    <div>
      <div className="form-group">
        {errors.first_name && <div className="error-description">{errors.first_name.join(', ')}</div>}
        <input
          className={`${errors.first_name ? 'error' : ''} form-control`}
          type="text"
          name="first_name"
          placeholder={I18n.t('apps.users.first_name')}
          onChange={onChange}
          value={user.first_name}
        />
      </div>
      <div className="form-group">
        {errors.last_name && <div className="error-description">{errors.last_name.join(', ')}</div>}
        <input
          className={`${errors.last_name ? 'error' : ''} form-control`}
          type="text"
          name="last_name"
          placeholder={I18n.t('apps.users.last_name')}
          value={user.last_name}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <NavLink className="btn btn-primary" to={`/users/${user.id}/external_authorization`}>{I18n.t('common.external_auth')}</NavLink>
      </div>
      <div className="form-group">
        <select className="form-control" name="lang" onChange={onChange} value={user.lang}>
          <option value="pl">pl</option>
          <option value="en">en</option>
        </select>
      </div>
    </div>
  );
}

UserFields.propTypes = {
  user: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default UserFields;
