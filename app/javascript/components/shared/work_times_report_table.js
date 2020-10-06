import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { displayDayInfo, displayDuration } from './helpers';
import WorkTimeDuration from './work_time_duration';
import WorkTimeTime from './work_time_time';
import WorkTimeDescription from './work_time_description';

function WorkTimesReportTable(props) {
  const { workTimes } = props;

  function renderEntry(workTime) {
    return (
      <li
        className="entry"
        key={workTime.id}
      >
        <div className="col-md-2 project-container">
          {workTime.user_name}
        </div>
        <div className="col-md-1">
          <a href={workTime.task} target="_blank" rel="noopener noreferrer">{workTime.task_preview}</a>
        </div>
        <div className="col-md-4 description-container" style={{ cursor: 'inherit' }}>
          <span className="description-text">
            {WorkTimeDescription(workTime)}
          </span>
        </div>
        {workTime.tag && (
          <div className="col-md-2 tag-container" style={{ marginTop: '15px' }}>
            <input
              disabled
              className={`tags selected ${workTime.tag}`}
              type="button"
              value={workTime.tag.toUpperCase()}
            />
          </div>
        )}
        <div className="col-md-1">
          <WorkTimeDuration workTime={workTime} />
        </div>
        <div className="col-md-2">
          <WorkTimeTime workTime={workTime} />
        </div>
      </li>
    );
  }

  function renderEntries() {
    const groupedWorkTimes = _.groupBy(workTimes, 'date');

    return _.map(groupedWorkTimes, (records, key) => (
      <section className="time-entries-day" key={key}>
        <header>
          <div className="date-container">
            <span className="title">{displayDayInfo(key)}</span>
            <span className="super">{displayDuration(_.sumBy(records, 'duration'))}</span>
            <div className="time-entries-list-container">
              <ul className="time-entries-list">
                {records.map((record) => renderEntry(record))}
              </ul>
            </div>
          </div>
        </header>
      </section>
    ));
  }

  return renderEntries();
}

WorkTimesReportTable.propTypes = {
  workTimes: PropTypes.array,
};

export default WorkTimesReportTable;
