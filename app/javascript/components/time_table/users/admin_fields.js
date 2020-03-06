import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

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
        {errors.first_name && <div className="error-description">{errors.first_name.join(', ')}</div>}
        <input
          className={`${errors.first_name ? 'error' : ''} form-control`}
          type="text"
          name="first_name"
          placeholder={I18n.t('apps.users.first_name')}
          onChange={onChange}
          value={user.first_name || ''}
        />
      </div>
      <div className="form-group">
        {errors.last_name && <div className="error-description">{errors.last_name.join(', ')}</div>}
        <input
          className={`${errors.last_name ? 'error' : ''} form-control`}
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
      <div className="form-group">
        {errors.birthdate && <div className="error-description">{errors.birthdate.join(', ')}</div>}
        <input
          className={`${errors.birthdate ? 'error' : ''} form-control`}
          value={moment(user.birthdate).format('YYYY-MM-DD')}
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
      <div className="form-group">
        <select className="form-control" name="lang" onChange={onChange} value={user.lang}>
          <option value="pl">pl</option>
          <option value="en">en</option>
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
