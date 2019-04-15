import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

const timeFormat = (time) => moment(time).format('HH:mm');

const WorkTimeTime = ({ onClick, children, workTime  }) => ( 
  <div className="time-container">
    <div className="time" onClick={onClick}>
      {timeFormat(workTime.starts_at)} - {timeFormat(workTime.ends_at)}
    </div>
    {children}
  </div>
);

WorkTimeTime.propTypes = {
  workTime: PropTypes.shape({
    onClick: PropTypes.func,
    starts_at: PropTypes.string,
    ends_at: PropTypes.string,
  }),
};

export default WorkTimeTime;