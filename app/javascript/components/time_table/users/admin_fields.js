import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

function AdminFields(props) {
  const {
    user,
    errors,
    onChange,
  } = props;

  return (
    <div>
      <div className="form-group">
        {errors.email && <div className="error-description">{errors.email.join(', ')}</div>}
        <input
          className={`${errors.email ? 'error' : ''} form-control`}
          type="text"
          name="email"
          placeholder="Email"
          onChange={onChange}
          value={user.email || ''}
        />
      </div>

      <div className="form-group">
        {errors.firstName && <div className="error-description">{errors.firstName.join(', ')}</div>}
        <input
          className={`${errors.firstName ? 'error' : ''} form-control`}
          type="text"
          name="first_name"
          placeholder={I18n.t('apps.users.first_name')}
          onChange={onChange}
          value={user.first_name || ''}
        />
      </div>
      <div className="form-group">
        {errors.lastName && <div className="error-description">{errors.lastName.join(', ')}</div>}
        <input
          className={`${errors.lastName ? 'error' : ''} form-control`}
          type="text"
          name="last_name"
          placeholder={I18n.t('apps.users.last_name')}
          value={user.last_name || ''}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        {errors.contract_name && <div className="error-description">{errors.contract_name.join(', ')}</div>}
        <input
          className={`${errors.contract_name ? 'error' : ''}form-control`}
          type="text"
          name="contract_name"
          placeholder={I18n.t('apps.users.contract_id')}
          value={user.contract_name || ''}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        {errors.phone && <div className="error-description">{errors.phone.join(', ')}</div>}
        <input
          className={`${errors.phone ? 'error' : ''} form-control`}
          type="text"
          name="phone"
          placeholder={I18n.t('apps.users.phone')}
          value={user.phone || ''}
          onChange={onChange}
        />
      </div>
      { user.id !== currentUser.id && (
        <div className="form-group">
          <label>
            {I18n.t('apps.users.user_active')}
            <input type="checkbox" name="active" checked={user.active || false} onChange={onChange} />
          </label>
        </div>
      )}
      { user.id === currentUser.id && (
        <div className="form-group">
          <NavLink className="btn btn-primary" to={`/users/${user.id}/external_authorization`}>{I18n.t('common.external_auth')}</NavLink>
        </div>
      )}
      <div className="form-group">
        <select className="form-control" name="lang" onChange={onChange} value={user.lang}>
          <option value="pl">pl</option>
          <option value="en">en</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="department">{I18n.t('apps.users.department')}</label>
        <select id="department" className="form-control" name="department" onChange={onChange} value={user.department}>
          <option value="dev">{I18n.t('apps.department.dev')}</option>
          <option value="qa">{I18n.t('apps.department.qa')}</option>
          <option value="ux">{I18n.t('apps.department.ux')}</option>
          <option value="pm">{I18n.t('apps.department.pm')}</option>
          <option value="other">{I18n.t('apps.department.other')}</option>
        </select>
      </div>
    </div>
  );
}

AdminFields.propTypes = {
  user: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AdminFields;
