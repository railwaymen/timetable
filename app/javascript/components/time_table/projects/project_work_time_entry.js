import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { displayDayInfo, displayDuration } from '../../shared/helpers';
import WorkTimeDuration from '../../shared/work_time_duration';
import WorkTimeTime from '../../shared/work_time_time';
import WorkTimeDescription from '../../shared/work_time_description';

function ProjectWorkTimeEntry(props) {
  const { dayKey, groupedWorkTimes } = props;

  return (
    <section className="time-entries-day">
      <header>
        <div className="date-container">
          <span className="title">{displayDayInfo(groupedWorkTimes[dayKey][0].starts_at)}</span>
          <span className="super">{displayDuration(_.sumBy(groupedWorkTimes[dayKey], (w) => w.duration))}</span>
          <div className="time-entries-list-container">
            <ul className="time-entries-list">
              {groupedWorkTimes[dayKey].map((workTime) => (
                <li
                  className={`entry ${workTime.updated_by_admin ? 'updated' : ''}`}
                  id={`work-time-${workTime.id}`}
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
              ))}
            </ul>
          </div>
        </div>
      </header>
    </section>
  );
}

ProjectWorkTimeEntry.propTypes = {
  dayKey: PropTypes.string,
  groupedWorkTimes: PropTypes.object,
};

export default ProjectWorkTimeEntry;
