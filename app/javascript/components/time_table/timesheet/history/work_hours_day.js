import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import WorkHours from './work_hours';
import { displayDuration, displayDayInfo } from '../../../shared/helpers';

class WorkHoursDay extends React.Component {
  constructor(props) {
    super(props);

    this.totalDurationViaProps = this.totalDurationViaProps.bind(this);
    this.increaseWorkHours = this.increaseWorkHours.bind(this);
    this.updateWorkHours = this.updateWorkHours.bind(this);

    this.state = {
      total: '00:00',
    };
  }

  componentDidMount() {
    this.setState({
      total: this.totalDurationViaProps(),
    });
  }

  increaseWorkHours(seconds) {
    const time = moment.duration(this.state.total, 'seconds').add(seconds, 'seconds');
    let hours = time.hours();
    let minutes = time.minutes();

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;

    this.setState({ total: `${hours}:${minutes}` }, () => {
      this.props.increaseWorkHours(seconds);
    });
  }

  totalDurationViaProps() {
    return displayDuration(_.sumBy(this.props.day, (w) => w.duration));
  }

  updateWorkHours(component, deviation) {
    if (moment(component.state.workHours.starts_at).format('YYYYMMDD') !== this.props.fingerPrint) {
      this.props.removeWorkHours(component, () => { this.props.pushEntry(component.state.workHours); });
    } else {
      this.props.updateWorkHours(component);
      this.increaseWorkHours(deviation);
    }
  }

  render() {
    const { day } = this.props;
    const { total } = this.state;

    return (
      <section className="time-entries-day">
        <header>
          <div className="date-container">
            <h3 className="title">
              { displayDayInfo(day ? day[0].starts_at : undefined) }
              <span className="super">
                {total}
              </span>
            </h3>
            {/* eslint-disable */}
            { day.map((workHours, index) => (
              <WorkHours
                key={index}
                updateWorkHours={this.updateWorkHours}
                workHours={workHours}
                fingerPrint={this.props.fingerPrint}
                assignModalInfo={this.props.assignModalInfo}
                onCopy={this.props.onCopy}
                removeWorkHours={this.props.removeWorkHours}
                projects={this.props.projects}
                tags={this.props.tags}
                tags_disabled={this.props.tags_disabled}
              />
            )) }
            {/* eslint-enable */}
          </div>
        </header>
      </section>
    );
  }
}

WorkHoursDay.propTypes = {
  workHours: PropTypes.array,
  total: PropTypes.string,
};

export default WorkHoursDay;
