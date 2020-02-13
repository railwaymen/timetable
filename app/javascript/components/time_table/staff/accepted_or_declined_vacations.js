import React from 'react';
import AcceptedOrDeclinedVacation from './accepted_or_declined_vacation';

const AcceptedOrDeclinedVacations = (props) => {
  const title = props.showDeclined ? { mainTitle: 'declined', leftTitle: 'show_accepted' } : { mainTitle: 'accepted', leftTitle: 'show_declined' };

  return (
    <div className="row accepted-or-declined-vacations">
      <div className="vacations-title">
        { window.currentUser.staff_manager
              && (
                <div className="left-title" onClick={() => props.onShowButtonChange('showDeclined')}>
                  {I18n.t(`apps.staff.${title.leftTitle}`)}
                </div>
              )
        }
        <div className="mid-title">
          {I18n.t(`apps.staff.${title.mainTitle}`)}
        </div>
      </div>
      {props.acceptedOrDeclinedVacationsList.map(vacation => <AcceptedOrDeclinedVacation key={vacation.id} vacation={vacation} addToAcceptedOrDeclinedVacationList={props.addToAcceptedOrDeclinedVacationList} removeFromAcceptedOrDeclined={props.removeFromAcceptedOrDeclined} showAll={props.showAll} showDeclined={props.showDeclined} getVacationApplications={props.getVacationApplications} />)}
    </div>
  );
};

export default AcceptedOrDeclinedVacations;
