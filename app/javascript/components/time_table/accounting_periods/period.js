import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NavLink } from 'react-router-dom';

class Period extends React.Component {
  constructor (props) {
    super(props);

    this.onDelete = this.onDelete.bind(this);
  }

  static propTypes = {
    period: PropTypes.object
  }

  formatDate (date) {
    return moment(date).format('YYYY-MM-DD HH:mm')
  }

  formatTime (duration) {
    let d = moment.duration(duration, 'seconds').asMinutes();
    let hours = Math.floor(d / 60);
    let minutes = Math.floor(d % 60);

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  formatNote (note) {
    return `${note}`.split("\n").map((line, idx) => <p key={idx}>{line}</p>)
  }

  onDelete () {
    if (confirm(I18n.t('common.confirm'))) this.props.onDelete(this.props.period.id);
  }

  render () {
    const { period, userName } = this.props;

    return (
      <tr>
        <td>{period.position}</td>
        <td>{userName}</td>
        <td>{period.starts_at ? this.formatDate(period.starts_at) : ''}</td>
        <td>{period.ends_at ? this.formatDate(period.ends_at) : ''}</td>
        <td>{this.formatTime(period.counted_duration)}/{this.formatTime(period.duration)}</td>
        <td>{this.formatNote(period.note)}</td>
        <td>{period.closed ? <i className="glyphicon glyphicon-ok"></i> : ''}</td>
        <td>{period.full_time ? <i className="glyphicon glyphicon-ok"></i> : ''}</td>
        <td>
          { currentUser.admin ?
            <span>
              <NavLink to={`/accounting_periods/edit/${period.id}?user_id=${period.user_id}`} className="btn btn-default edit">{I18n.t('common.edit')}</NavLink>
              <div onClick={this.onDelete} className="btn btn-danger delete">{I18n.t('common.destroy')}</div>
            </span> : null }
        </td>
      </tr>
    )
  }
}

export default Period;
