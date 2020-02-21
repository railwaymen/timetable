import React from 'react';
import URI from 'urijs';
import AcceptedOrDeclinedVacation from './accepted_or_declined_vacation';

class AcceptedOrDeclinedVacations extends React.Component {
  constructor(props) {
    super(props);

    this.onSortChange = this.onSortChange.bind(this);
  }

  state = {
    sort: 'asc',
  }

  componentDidMount() {
    const { sort } = URI.parseQuery(URI(window.location.href).query());
    if (sort) { this.setState({ sort }); }
  }

  onSortChange() {
    const { sort } = this.state;
    const newSort = sort === 'asc' ? 'desc' : 'asc';
    this.props.getVacationApplications({ sort: newSort }, false);
  }

  setSort(sort) {
    this.setState({ sort });
  }

  render() {
    const title = this.props.showDeclined ? { mainTitle: 'declined', leftTitle: 'show_accepted' } : { mainTitle: 'accepted', leftTitle: 'show_declined' };
    const sortIcon = this.state.sort === 'asc' ? 'up' : 'down';

    return (
      <div className="row accepted-or-declined-vacations">
        <div className="vacations-title">
          { window.currentUser.staff_manager
                && (
                  <div className="left-title" onClick={() => this.props.onShowButtonChange('showDeclined')}>
                    {I18n.t(`apps.staff.${title.leftTitle}`)}
                  </div>
                )
          }
          <div className="mid-title">
            {I18n.t(`apps.staff.${title.mainTitle}`)}
          </div>
          <div className="right-title" onClick={this.onSortChange}>
            {I18n.t('apps.staff.sort_direction')}
            <i className={`glyphicon glyphicon-chevron-${sortIcon}`} />
          </div>
        </div>
        {this.props.acceptedOrDeclinedVacationsList.map(vacation => <AcceptedOrDeclinedVacation key={vacation.id} vacation={vacation} addToAcceptedOrDeclinedVacationList={this.props.addToAcceptedOrDeclinedVacationList} removeFromAcceptedOrDeclined={this.props.removeFromAcceptedOrDeclined} showAll={this.props.showAll} showDeclined={this.props.showDeclined} getVacationApplications={this.props.getVacationApplications} />)}
      </div>
    );
  }
}

export default AcceptedOrDeclinedVacations;
