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

  onDelete () {
    this.props.onDelete(this.props.period.id);
  }

  render () {
    const { period, userName } = this.props;

    return (
      <tr>
        <td>{period.position}</td>
        <td>{userName}</td>
        <td>{this.formatDate(period.starts_at)}</td>
        <td>{this.formatDate(period.ends_at)}</td>
        <td>{this.formatTime(period.counted_duration)}/{this.formatTime(period.duration)}</td>
        <td>{period.note}</td>
        <td>{period.closed ? <i class="glyphicon glyphicon-ok"></i> : ''}</td>
        <td>{period.full_time ? <i class="glyphicon glyphicon-ok"></i> : ''}</td>
        <td>
          <NavLink to={`/accounting_periods/edit/${period.id}?user_id=${period.user_id}`} className="btn btn-default edit">Edit</NavLink>
          <div onClick={this.onDelete} className="btn btn-danger delete">Delete</div>
        </td>
      </tr>
    )
  }
}

export default Period;
