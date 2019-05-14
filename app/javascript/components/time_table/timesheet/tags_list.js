import React from 'react';
import PropTypes from 'prop-types';
import TagPill from './tag_pill';

function TagsList({ selectedTag, onChangeTag, tags }) {
  const onClick = (tagKey) => {
    if (tagKey === selectedTag) {
      onChangeTag('dev');
    } else {
      onChangeTag(tagKey);
    }
  };

  return (
    <div className="visible" tabIndex="-1">
      { tags.map((tag) => {
        if (tag === 'dev') {
          return null;
        }
        return (
          <TagPill selected={tag === selectedTag} key={tag} tag={tag} onClick={() => onClick(tag)} />
        );
      })}
    </div>
  );
}

TagsList.propTypes = {
  selectedTag: PropTypes.string.isRequired,
  onChangeTag: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

TagsList.defaultProps = {
  onChangeTag: () => {},
};

export default TagsList;
