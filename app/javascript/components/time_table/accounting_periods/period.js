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
        <td className="text-center">{period.starts_at ? this.formatDate(period.starts_at) : ''}</td>
        <td className="text-center">{period.ends_at ? this.formatDate(period.ends_at) : ''}</td>
        <td className={`text-center period-duration-progress ${period.counted_duration >= period.duration ? 'period-completed' : 'in-progress'}`}>
          <span data-tooltip-bottom={`${((period.counted_duration / period.duration) * 100).toFixed(2)}%`}>
            {this.formatTime(period.counted_duration)}
/
            {this.formatTime(period.duration)}
          </span>
        </td>
        <td>{preserveLines(period.note || '')}</td>
        <td className="text-center">{period.closed ? <i className="symbol state-symbol fa fa-lock" data-tooltip-bottom={I18n.t('apps.accounting_periods.closed')} /> : ''}</td>
        <td className="text-center">
          {period.full_time
            && (
              <span className="symbol state-symbol symbol-full-time" data-tooltip-bottom={I18n.t('apps.accounting_periods.full_time')}>
                <i className="sub-symbol s-document fa fa-file-text-o" />
                <i className="sub-symbol s-check fa fa-check" />
              </span>
            )
          }
        </td>
        <td className="nowrap text-right">
          { currentUser.admin
            ? (
              <React.Fragment>
                <NavLink to={`/accounting_periods/edit/${period.id}?user_id=${period.user_id}`} className="bt bt-second edit">
                  <i className="symbol fa fa-pencil" />
                  <span className="bt-txt">{I18n.t('common.edit')}</span>
                </NavLink>
                <button onClick={this.onDelete} type="button" className="bt bt-danger delete">
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
