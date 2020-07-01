import React from 'react';
import InteractedVacation from './interacted_vacation';

function InteractedVacations(props) {
  const {
    interactedVacations,
    showDeclined,
    setShowDeclined,
    filters,
    setFilters,
    getVacations,
    removeFromInteractedVacations,
    addToInteractedVacations,
  } = props;
  const { interactedOrder } = filters;

  function onOrderChange() {
    if (interactedOrder === 'asc') {
      setFilters({ ...filters, interactedOrder: 'desc' });
    } else {
      setFilters({ ...filters, interactedOrder: 'asc' });
    }
  }

  const title = showDeclined ? { mainTitle: 'declined', leftTitle: 'show_accepted' } : { mainTitle: 'accepted', leftTitle: 'show_declined' };
  const orderIcon = interactedOrder === 'asc' ? 'up' : 'down';

  return (
    <div className="accepted-or-declined-vacations">
      <div className="vacations-title row mx-0 my-2 position-relative">
        { window.currentUser.staff_manager && (
          <div className="left-title" onClick={() => setShowDeclined(!showDeclined)}>
            {I18n.t(`apps.staff.${title.leftTitle}`)}
          </div>
        )}
        <div className="mid-title">
          {I18n.t(`apps.staff.${title.mainTitle}`)}
        </div>
        <div className="right-title" onClick={onOrderChange}>
          {I18n.t('apps.staff.order_direction')}
          <i className={`fa fa-chevron-${orderIcon}`} />
        </div>
      </div>
      {interactedVacations.map((vacation) => (
        <InteractedVacation
          key={vacation.id}
          propsVacation={vacation}
          getVacations={getVacations}
          removeFromInteractedVacations={removeFromInteractedVacations}
          addToInteractedVacations={addToInteractedVacations}
        />
      ))}
    </div>
  );
}

export default InteractedVacations;
