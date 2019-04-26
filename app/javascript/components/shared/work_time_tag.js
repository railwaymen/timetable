import React from 'react';
import PropTypes from 'prop-types';

const WorkTimeTag = ({
  onClick, children, workTime, tagEditable,
}) => {
  if (tagEditable) return children;
  if (workTime.tag === 'dev') return null;
  return (
    <div className="tag-container">
      <div className="tag" onClick={onClick}>
        <button className="btn btn-info" type="button">
          #
          {workTime.tag}
        </button>
      </div>
    </div>
  );
};

WorkTimeTag.propTypes = {
  onClick: () => {},
  workTime: PropTypes.shape({
    tag: PropTypes.string,
  }).isRequired,
};

export default WorkTimeTag;
