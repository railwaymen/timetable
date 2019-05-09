import React from 'react';
import PropTypes from 'prop-types';

const WorkTimeTag = ({
  onClick, children, workTime, tagEditable,
}) => {
  if (tagEditable) return children;
  if (workTime.tag.key === 'dev') return null;
  return (
    <div className="tag-container" style={{ marginTop: '16px' }}>
      <input onClick={onClick} className={`tags clickable ${workTime.tag.key}`} type="button" value={workTime.tag.value.toUpperCase()} />
    </div>
  );
};

WorkTimeTag.propTypes = {
  onClick: () => {},
  workTime: PropTypes.shape({
    tag: PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }),
  }).isRequired,
};

export default WorkTimeTag;
