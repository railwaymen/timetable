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
  const { sort } = filters;

  function onSortChange() {
    if (sort === 'asc') {
      setFilters({ ...filters, sort: 'desc' });
    } else {
      setFilters({ ...filters, sort: 'asc' });
    }
  }

  const title = showDeclined ? { mainTitle: 'declined', leftTitle: 'show_accepted' } : { mainTitle: 'accepted', leftTitle: 'show_declined' };
  const sortIcon = sort === 'asc' ? 'up' : 'down';

  return (
    <div className="row accepted-or-declined-vacations">
      <div className="vacations-title">
        { window.currentUser.staff_manager && (
          <div className="left-title" onClick={() => setShowDeclined(!showDeclined)}>
            {I18n.t(`apps.staff.${title.leftTitle}`)}
          </div>
        )}
        <div className="mid-title">
          {I18n.t(`apps.staff.${title.mainTitle}`)}
        </div>
        <div className="right-title" onClick={onSortChange}>
          {I18n.t('apps.staff.sort_direction')}
          <i className={`glyphicon glyphicon-chevron-${sortIcon}`} />
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
