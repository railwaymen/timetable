import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NavLink } from 'react-router-dom';
import { preserveLines } from '../../shared/helpers';

class Period extends React.Component {
  constructor(props) {
    super(props);

    this.onDelete = this.onDelete.bind(this);
  }

  static propTypes = {
    period: PropTypes.object,
  }

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  formatTime(duration) {
    const d = moment.duration(duration, 'seconds').asMinutes();
    let hours = Math.floor(d / 60);
    let minutes = Math.floor(d % 60);

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  onDelete() {
    if (window.confirm(I18n.t('common.confirm'))) this.props.onDelete(this.props.period.id);
  }

  render() {
    const { period, userName } = this.props;

    return (
      <tr>
        <td>{period.position}</td>
        <td>{userName}</td>
        <td>{period.starts_at ? this.formatDate(period.starts_at) : ''}</td>
        <td>{period.ends_at ? this.formatDate(period.ends_at) : ''}</td>
        <td>
          {this.formatTime(period.counted_duration)}
/
          {this.formatTime(period.duration)}
        </td>
        <td>{preserveLines(period.note || '')}</td>
        <td>{period.closed ? <i className="glyphicon glyphicon-ok" /> : ''}</td>
        <td>{period.full_time ? <i className="glyphicon glyphicon-ok" /> : ''}</td>
        <td className="nowrap">
          { currentUser.admin
            ? (
              <React.Fragment>
                <NavLink to={`/accounting_periods/edit/${period.id}?user_id=${period.user_id}`} className="bt bt-second bt-small edit">
                  <i className="symbol fa fa-pencil" />
                  <span className="bt-txt">{I18n.t('common.edit')}</span>
                </NavLink>
                <button onClick={this.onDelete} className="bt bt-danger bt-small delete">
                  <i className="symbol fa fa-trash-o" />
                  <span className="bt-txt">{I18n.t('common.destroy')}</span>
                </button>
              </React.Fragment>
            ) : null }
        </td>
      </tr>
    );
  }
}

export default Period;
