import _ from 'lodash';
import React from 'react';
import { formattedDuration } from '../../shared/helpers';

function MilestoneSummaryByPeople(props) {
  const { workTimesSumByUser, selectedUser, setSelectedUser } = props;

  const total = _.sum(Object.values(workTimesSumByUser));

  function onUserClick(user) {
    if (user === selectedUser) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  }

  function renderUserDuration(user, duration) {
    const percentage = Math.round((duration / total) * 100);
    const selectedClass = user === selectedUser ? 'selected-border' : '';

    return (
      <div className={`row ${selectedClass}`} key={user}>
        <div className="col-6 cursor-pointer" onClick={() => onUserClick(user)}>{user}</div>
        <div className="col-3">{formattedDuration(duration)}</div>
        <div className="col-3">
          {percentage}
          %
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <h4>{I18n.t('apps.milestone_reports.by_users')}</h4>
      {_.map(workTimesSumByUser, (duration, user) => (
        renderUserDuration(user, duration)
      ))}
    </div>
  );
}

export default MilestoneSummaryByPeople;
