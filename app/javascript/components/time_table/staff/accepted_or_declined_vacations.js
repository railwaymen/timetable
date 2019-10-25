import React from 'react'
import moment from 'moment';
import PropTypes from 'prop-types';

class AcceptedVacations extends React.Component {
  constructor(props) {
    super(props);

    this.renderAcceptedVacations = this.renderAcceptedVacations.bind(this);
  }

  renderAcceptedVacations(vacation) {
    return(
      <tr key={vacation.id}>
        <td>{vacation.full_name}</td>
        <td>{I18n.t(`common.${vacation.vacation_type}`)}</td>
        <td>{moment(vacation.start_date).format('DD/MM/YYYY')}-{moment(vacation.end_date).format('DD/MM/YYYY')}</td>
      </tr>
    )
  }

  render() {
    const title = this.props.showDeclined ? { mainTitle: 'declined', leftTitle: 'show_accepted' } : { mainTitle: 'accepted', leftTitle: 'show_declined' };

    return(
      <div className="row accepted-or-declined-vacations">
        <div className="vacations-title">
          { window.currentUser.staff_manager
                && <div className="left-title" onClick={() => this.props.onShowButtonChange('showDeclined')}>
                     {I18n.t(`apps.staff.${title.leftTitle}`)}
                   </div>
          }
          <div className="mid-title">
            {I18n.t(`apps.staff.${title.mainTitle}`)}
          </div>
        </div>
        <table className="vacations-table">
          <thead>
            <tr>
              <th>{I18n.t('apps.staff.person')}</th>
              <th>{I18n.t('apps.staff.vacation_type')}</th>
              <th>{I18n.t('apps.staff.time_period')}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.acceptedOrDeclinedVacationsList.map((vacation) => this.renderAcceptedVacations(vacation))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default AcceptedVacations