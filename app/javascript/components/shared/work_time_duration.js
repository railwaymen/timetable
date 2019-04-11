import React from 'react';
import PropTypes from 'prop-types';
import { displayDuration } from './helpers';

export const WorkTimeDuration = ({ workTime }) => ( 
  <div className="duration-container">
    <div className="duration">
      {displayDuration(workTime.duration)}
    </div>
  </div>
);

WorkTimeDuration.propTypes = {
  workTime: PropTypes.shape({
    duration: PropTypes.number,
  }),
};

export default WorkTimeDuration;