import React from 'react';
import PropTypes from 'prop-types';
import tagShape from './tag_shape';
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
        if (tag.key === 'dev') {
          return null;
        }
        return (
          <TagPill selected={tag.key === selectedTag} key={tag.key} tag={tag} onClick={() => onClick(tag.key)} />
        );
      })}
    </div>
  );
}

TagsList.propTypes = {
  selectedTag: PropTypes.string.isRequired,
  onChangeTag: PropTypes.func,
  tags: PropTypes.arrayOf(tagShape).isRequired,
};

TagsList.defaultProps = {
  onChangeTag: () => {},
};

export default TagsList;
