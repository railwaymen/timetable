import React from 'react';
import PropTypes from 'prop-types';

const WorkTimeTask = ({ workTime }) => (
  <div className="task-container">
    <span className="description-text">
      <a href={workTime.task} target="_blank">{workTime.task_preview}</a>
    </span>
  </div>
);

WorkTimeTask.propTypes = {
  workTime: PropTypes.shape({
    task: PropTypes.string,
    task_preview: PropTypes.string
  }),
};

export default WorkTimeTask