import React from 'react';
import UnconfirmedVacation from './unconfirmed_vacation';

function UnconfirmedVacations(props) {
  const {
    unconfirmedVacations,
    showAll,
    setShowAll,
    removeFromInteractedVacations,
    addToInteractedVacations,
  } = props;
  const title = showAll ? { main_title: 'all', right_tittle: 'show_acceptable' } : { main_title: 'acceptable', right_tittle: 'show_all' };

  return (
    <div className="">
      <div className="vacations-title  row justify-content-start mx-0 my-2">
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
          />
        ))}
      </div>
    </div>
  );
}

export default UnconfirmedVacations;
