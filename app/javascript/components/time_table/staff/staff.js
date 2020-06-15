import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import URI from 'urijs';
import Filters from './filters';
import InteractedVacations from './interacted_vacations';
import UnconfirmedVacations from './unconfirmed_vacations';
import * as Api from '../../shared/api';

const defaultFilters = {
  selectedUserId: null,
  startDate: moment().startOf('month').format('DD/MM/YYYY'),
  endDate: null,
  interactedOrder: 'asc',
  waitingOrder: 'asc',
};

function Staff() {
  const [filters, setFilters] = useState(defaultFilters);
  const [vacations, setVacations] = useState({ interactedVacations: [], unconfirmedVacations: [] });
  const [showAll, setShowAll] = useState(false);
  const [showDeclined, setShowDeclined] = useState(false);
  const {
    selectedUserId,
    startDate,
    endDate,
    interactedOrder,
    waitingOrder,
  } = filters;
  const isFirstRun = useRef(true);

  function getVacations() {
    const prepareParams = {
      user_id: selectedUserId,
      start_date: startDate,
      end_date: endDate,
      interacted_order: interactedOrder,
      waiting_order: waitingOrder,
    };
    if (!selectedUserId) { delete prepareParams.user_id; }
    if (!startDate) { delete prepareParams.start_date; }
    if (!endDate) { delete prepareParams.end_date; }
    if (!interactedOrder) { delete prepareParams.interacted_order; }
    if (!waitingOrder) { delete prepareParams.waiting_order; }
    const url = URI('/api/vacations/vacation_applications');
    if (showAll) { url.addSearch({ show_all: true }); }
    if (showDeclined) { url.addSearch({ show_declined: true }); }
    url.addSearch(prepareParams);

    Api.makeGetRequest({ url })
      .then((response) => {
        const newPath = URI(window.location.href)
          .removeSearch('start_date')
          .removeSearch('end_date')
          .removeSearch('user_id')
          .removeSearch('interacted_order')
          .removeSearch('waiting_order')
          .addSearch(prepareParams);

        window.history.pushState('Timetable', 'Staff', newPath);
        setVacations({
          interactedVacations: response.data.accepted_or_declined_vacations,
          unconfirmedVacations: response.data.unconfirmed_vacations,
        });
      });
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    getVacations();
  }, [filters, showDeclined, showAll]);

  useEffect(() => {
    const urlQuery = URI.parseQuery(URI(window.location.href).query());
    const {
      user_id,
      start_date,
      end_date,
      interacted_order,
      waiting_order,
    } = urlQuery;
    const urlFilters = {};
    if (user_id) { urlFilters.selectedUserId = user_id; }
    if (start_date) { urlFilters.startDate = start_date; }
    if (end_date) { urlFilters.endDate = end_date; }
    if (interacted_order) { urlFilters.interactedOrder = interacted_order; }
    if (waiting_order) { urlFilters.waitingOrder = waiting_order; }
    setFilters({ ...filters, ...urlFilters });
  }, []);

  function removeFromInteractedVacations(object, action) {
    if ((showDeclined && action === 'decline') || (!showDeclined && action === 'accept')) { return; }
    const index = vacations.interactedVacations.findIndex((vacation) => vacation.id === object.id);
    if (index !== -1) {
      vacations.interactedVacations.splice(index, 1);
      setVacations({ ...vacations, interactedVacations: vacations.interactedVacations });
    }
  }

  function removeFromUnconfirmedVacation(object) {
    if (window.currentUser.staff_manager) {
      const undefinedIndex = vacations.unconfirmedVacations.findIndex((vacation) => vacation.id === object.id);
      vacations.unconfirmedVacations.splice(undefinedIndex, 1);
      setVacations({ ...vacations, unconfirmedVacations: vacations.unconfirmedVacations });
    }
  }

  function addToInteractedVacations(object, action) {
    if ((showDeclined && action === 'accept') || (!showDeclined && action === 'decline')) {
      removeFromUnconfirmedVacation(object);
      return;
    }
    const { interactedVacations, unconfirmedVacations } = vacations;
    const interactedIndex = interactedVacations.findIndex((vacation) => vacation.id === object.id);
    const undefinedIndex = unconfirmedVacations.findIndex((vacation) => vacation.id === object.id);
    if (interactedIndex === -1 && undefinedIndex !== -1) {
      unconfirmedVacations.splice(undefinedIndex, 1);
      setVacations({ interactedVacations: [object].concat(interactedVacations), unconfirmedVacations });
    }
  }

  return (
    <div className="staff-container">
      <Helmet>
        <title>{I18n.t('common.staff')}</title>
      </Helmet>
      <Filters filters={filters} setFilters={setFilters} defaultFilters={defaultFilters} />
      { currentUser.canManageStaff() && (
        <div className="container-fluid vacations-container">
          <div className="row">
            <div className="col-md-6 pl-0">
              <InteractedVacations
                interactedVacations={vacations.interactedVacations}
                showDeclined={showDeclined}
                setShowDeclined={setShowDeclined}
                filters={filters}
                setFilters={setFilters}
                getVacations={getVacations}
                removeFromInteractedVacations={removeFromInteractedVacations}
                addToInteractedVacations={addToInteractedVacations}
              />
            </div>
            <div className="col-md-6 pr-0">
              <UnconfirmedVacations
                unconfirmedVacations={vacations.unconfirmedVacations}
                showAll={showAll}
                setShowAll={setShowAll}
                filters={filters}
                setFilters={setFilters}
                removeFromInteractedVacations={removeFromInteractedVacations}
                addToInteractedVacations={addToInteractedVacations}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
