import React from 'react';
import UnconfirmedVacation from './unconfirmed_vacation';

function UnconfirmedVacations(props) {
  const {
    unconfirmedVacations,
    showAll,
    setShowAll,
    filters,
    setFilters,
    removeFromInteractedVacations,
    addToInteractedVacations,
    usersVacationDays,
    setUserVacationDays,
  } = props;
  const { waitingOrder } = filters;

  function onOrderChange() {
    if (waitingOrder === 'asc') {
      setFilters({ ...filters, waitingOrder: 'desc' });
    } else {
      setFilters({ ...filters, waitingOrder: 'asc' });
    }
  }

  const title = showAll ? { main_title: 'all', right_tittle: 'show_acceptable' } : { main_title: 'acceptable', right_tittle: 'show_all' };
  const orderIcon = waitingOrder === 'asc' ? 'up' : 'down';

  return (
    <>
      <div className="vacations-title row mx-0 my-2 position-relative">
        <div className="left-title" onClick={onOrderChange}>
          <i className={`fa fa-chevron-${orderIcon}`} />
          {I18n.t('apps.staff.order_direction')}
        </div>
        <div className="mid-title">{I18n.t(`apps.staff.${title.main_title}`)}</div>
        { window.currentUser.staff_manager && (
          <div className="right-title" onClick={() => setShowAll(!showAll)}>
            {I18n.t(`apps.staff.${title.right_tittle}`)}
          </div>
        )}
      </div>
      <div className="unconfirmed-vacations">
        {unconfirmedVacations.map((vacation) => (
          <UnconfirmedVacation
            key={vacation.id}
            propsVacation={vacation}
            removeFromInteractedVacations={removeFromInteractedVacations}
            addToInteractedVacations={addToInteractedVacations}
            availableVacationDays={usersVacationDays[vacation.user_id]}
            setUserVacationDays={setUserVacationDays}
          />
        ))}
      </div>
    </>
  );
}

export default UnconfirmedVacations;
