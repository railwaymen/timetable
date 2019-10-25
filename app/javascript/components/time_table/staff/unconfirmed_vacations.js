import React from 'react'
import UnconfirmedVacation from './unconfirmed_vacation'

class UnconfirmedVacations extends React.Component {
  constructor(props) {
    super(props);

    this.renderVacation = this.renderVacation.bind(this);
  }

  renderVacation(vacation) {
    return(
      <div className="row" key={vacation.id}>
        <UnconfirmedVacation vacation={vacation} addToAcceptedOrDeclinedVacationList={this.props.addToAcceptedOrDeclinedVacationList} removeFromAcceptedOrDeclined={this.props.removeFromAcceptedOrDeclined} showAll={this.props.showAll} showDeclined={this.props.showDeclined} />
      </div>
    )
  }

  render() {
    const title = this.props.showAll ? { main_title: 'all', right_tittle: 'show_acceptable' } : { main_title: 'acceptable', right_tittle: 'show_all' };

    return(
      <div className="row">
        <div className="vacations-title" style={{ textAlign: 'center' }}>
          <div className="mid-title">{I18n.t(`apps.staff.${title.main_title}`)}</div>
          { window.currentUser.staff_manager
                && <div className="right-title" onClick={() => this.props.onShowButtonChange('showAll')}>
                     {I18n.t(`apps.staff.${title.right_tittle}`)}
                   </div>
          }
        </div>
        <div className="unconfirmed-vacations">
          {this.props.unconfirmedVacationsList.map((vacation) => this.renderVacation(vacation))}
        </div>
      </div>
    )
  }
}

export default UnconfirmedVacations