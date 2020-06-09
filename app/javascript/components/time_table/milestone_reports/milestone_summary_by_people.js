import _ from 'lodash';
import React from 'react';
import { formattedDuration } from '../../shared/helpers';

function MilestoneSummaryByPeople(props) {
  const { workTimesSumByUser } = props;

  const total = _.sum(Object.values(workTimesSumByUser));

  function renderUserDuration(user, duration) {
    const percentage = Math.round((duration / total) * 100);

    return (
      <div className="row" key={user}>
        <div className="col-6">{user}</div>
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
