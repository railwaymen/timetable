import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

const timeFormat = (time) => moment(time).format('HH:mm');

const WorkTimeTime = ({ onClick, children, workTime }) => (
  <div className="time-container">
    <div className="time" onClick={onClick}>
      {`${timeFormat(workTime.starts_at)} - ${timeFormat(workTime.ends_at)}`}
    </div>
    {children}
  </div>
);

WorkTimeTime.defaultProps = {
  children: null,
  onClick: () => {},
};

WorkTimeTime.propTypes = {
  workTime: PropTypes.shape({
    starts_at: PropTypes.string,
    ends_at: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  children: PropTypes.any,
};

export default WorkTimeTime;
