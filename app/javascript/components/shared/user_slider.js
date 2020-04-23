import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

function UserSlider(props) {
  const { user, setUserId } = props;

  return (
    <div className="offset-md-3 col-md-6 vert-offset-bottom clearfix">
      <h3 className="text-center text-muted">
        {user.prev_id && (
          <a onClick={() => setUserId(user.prev_id)} className="fa fa-chevron-left pull-left" />
        )}

        {user.email ? (
          <span>
            <NavLink to={`/timesheet?user_id=${user.id}`}>{`${user.first_name} ${user.last_name}`}</NavLink>
          </span>
        ) : (
          <div style={{ width: '390px', display: 'inline-block' }} className="preloader" />
        )}

        <span>
          {user.next_id && (
            <a onClick={() => setUserId(user.next_id)} className="fa fa-chevron-right pull-right" />
          )}
        </span>
      </h3>
    </div>
  );
}

UserSlider.propTypes = {
  user: PropTypes.object,
  setUserId: PropTypes.func,
};

export default UserSlider;
