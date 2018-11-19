import React from 'react';
import PropTypes from 'prop-types';
import WorkHours from './work_hours.js';
import _ from 'lodash';
import moment from 'moment';

class WorkHoursDay extends React.Component {
  constructor (props) {
    super(props);

    this.totalDurationViaProps = this.totalDurationViaProps.bind(this);
    this.increaseWorkHours = this.increaseWorkHours.bind(this);
    this.updateWorkHours = this.updateWorkHours.bind(this);
  }

  static propTypes = {
    workHours: PropTypes.array,
    total: PropTypes.string
  }

  state = {
    total: '00:00'
  }

  componentDidMount () {
    this.setState({
      total: this.totalDurationViaProps()
    })
  }

  increaseWorkHours (seconds) {
    let time = moment.duration(this.state.total, 'seconds').add(seconds, 'seconds');
    let hours = time.hours();
    let minutes = time.minutes();

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    this.setState({ total: `${hours}:${minutes}` }, () => {
      this.props.increaseWorkHours(seconds);
    });
  }

  totalDurationViaProps () {
    let total = _.sumBy(this.props.day, (w) => w.duration)

    let time = moment.duration(total, 'seconds');
    let hours = time.hours();
    let minutes = time.minutes();

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}`;
  }

  displayDayInfo () {
    const day = this.props.day ? this.props.day[0] : {};
    const today = moment();
    const yesterday = moment().subtract(1, 'day');

    if (today.isSame(day.starts_at, 'day')) {
      return 'Today'
    } else if (yesterday.isSame(day.starts_at, 'day')) {
      return 'Yesterday'
    } else {
      return moment(day.starts_at).format('ddd DD, MMMM')
    }
  }

  updateWorkHours (component, deviation) {
    if (moment(component.state.workHours.starts_at).format('YYYYMMDD') !== this.props.fingerPrint) {
      this.props.removeWorkHours(component, () => { this.props.pushEntry(component.state.workHours) });
    } else {
      this.props.updateWorkHours(component);
      this.increaseWorkHours(deviation);
    }
  }

  render () {
    const { day } = this.props;
    const { total } = this.state;

    return (
      <section className="time-entries-day">
        <header>
          <div className="date-container">
            <span className="title">
              { this.displayDayInfo() }
            </span>
            <span className="super">{total}</span>
            { day.map((workHours, index) => (
              <WorkHours key={index}
                         updateWorkHours={this.updateWorkHours}
                         workHours={workHours}
                         fingerPrint={this.props.fingerPrint}
                         assignModalInfo={this.props.assignModalInfo}
                         onCopy={this.props.onCopy}
                         removeWorkHours={this.props.removeWorkHours}
                         projects={this.props.projects} />
            )) }
          </div>
        </header>
      </section>
    )
  }
}

export default WorkHoursDay;
