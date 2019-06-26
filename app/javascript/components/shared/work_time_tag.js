import React from 'react';
import PropTypes from 'prop-types';

const WorkTimeTag = ({
  onClick, children, workTime, tagEditable,
}) => {
  if (tagEditable) return children;
  if (workTime.tag === 'dev') return null;
  return (
    <div className="tag-container">
      <input onClick={onClick} className={`tags selected clickable ${workTime.tag}`} type="button" value={I18n.t(`apps.tag.${workTime.tag}`).toUpperCase()} />
    </div>
  );
};

WorkTimeTag.propTypes = {
  onClick: () => {},
  workTime: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }).isRequired,
};

export default WorkTimeTag;
