import React from 'react';
import URI from 'urijs';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import * as Api from '../../shared/api';
import VacationPeriod from './vacation_period';

class VacationPeriods extends React.Component {
  constructor(props) {
    super(props);

    this.getVacationPeriods = this.getVacationPeriods.bind(this);
    this.onNextUserChange = this.onNextUserChange.bind(this);
    this.onPreviousUserChange = this.onPreviousUserChange.bind(this);
    this.onGenerateClick = this.onGenerateClick.bind(this);

    this.state = {
      vacationPeriods: [],
      user: {},
      userId: undefined,
    };
  }

  componentDidMount() {
    const base = URI(window.location.href);
    const params = base.query(true);
    const userId = (params.user_id || currentUser.id);

    this.getVacationPeriods({ userId });
  }

  getVacationPeriods(options) {
    Api.makeGetRequest({
      url: `/api/vacation_periods?user_id=${options.userId}`,
    }).then((response) => {
      const vacationPeriods = response.data.vacation_periods;
      Api.makeGetRequest({
        url: `/api/users/${options.userId}`,
      }).then((userResponse) => {
        this.setState({
          vacationPeriods,
          userId: options.userId,
          user: userResponse.data,
        });
      });
    });
  }

  onPreviousUserChange() {
    const id = this.state.user.prev_id;

    if (id) {
      this.getVacationPeriods({ userId: id });
      window.history.pushState('TimeTable',
        'Vacation Periods',
        URI(window.location.href).search({ user_id: id }));
    }
  }

  onNextUserChange() {
    const id = this.state.user.next_id;

    if (id) {
      this.getVacationPeriods({ userId: id });
      window.history.pushState('TimeTable',
        'Vacation Periods',
        URI(window.location.href).search({ user_id: id }));
    }
  }

  renderUserInfo(user) {
    if (_.isEmpty(user)) {
      return (
        <div style={{ width: '390px', display: 'inline-block' }} className="preloader" />
      );
    }
    return (
      <span><NavLink to={`/timesheet?user_id=${user.id}`}>{`${user.first_name} ${user.last_name}`}</NavLink></span>
    );
  }

  onGenerateClick() {
    Api.makePostRequest({
      url: '/api/vacation_periods/generate',
      body: { user_id: this.state.userId },
    }).then((response) => {
      this.setState({
        vacationPeriods: response.data,
      });
    });
  }

  render() {
    const { vacationPeriods, user, userId } = this.state;

    return (
      // accounting-periods-list class only for styling
      <div className="vacation-periods-list accounting-periods-list">
        <Helmet>
          <title>{`${I18n.t('common.vacation_periods')}`}</title>
        </Helmet>
        { currentUser.admin && (
          <div className="row periods-actions">
            <div className="col-md-8">
              <div id="generate" className="bt bt-second" onClick={this.onGenerateClick}>
                <span className="bt-txt">{I18n.t('apps.vacation_periods.generate_periods')}</span>
                <i className="symbol fa fa-calendar-plus-o" />
              </div>
            </div>
          </div>
        )}
        <div className="col-md-offset-3 col-md-6 vert-offset-bottom clearfix">
          { currentUser.admin && (
            <h3 className="text-center text-muted">
              {user.prev_id && (
                <a onClick={this.onPreviousUserChange} className="glyphicon glyphicon-chevron-left pull-left" />
              )}
              {this.renderUserInfo(user)}
              <span>
                {user.next_id && (
                  <a onClick={this.onNextUserChange} className="glyphicon glyphicon-chevron-right pull-right" />
                )}
              </span>
            </h3>
          )}
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{I18n.t('common.person')}</th>
              <th>{I18n.t('common.from')}</th>
              <th>{I18n.t('common.to')}</th>
              <th>{I18n.t('apps.vacation_periods.vacation_days')}</th>
              <th className="text-left">{I18n.t('apps.vacation_periods.note')}</th>
              {currentUser.admin && <th />}
            </tr>
          </thead>
          <tbody>
            { vacationPeriods.map((period) => (
              <VacationPeriod
                key={period.id}
                period={period}
                userName={userId ? `${user.first_name} ${user.last_name}` : `${currentUser.first_name} ${currentUser.last_name}`}
              />
            )) }
          </tbody>
        </table>
      </div>
    );
  }
}

export default VacationPeriods;
