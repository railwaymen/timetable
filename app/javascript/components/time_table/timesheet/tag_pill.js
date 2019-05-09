import React from 'react';
import { func, bool } from 'prop-types';
import tagShape from './tag_shape';

const TagPill = ({ tag, selected, onClick }) => (
  <input
    className={selected ? `tags clickable selected ${tag.key}` : `tags clickable ${tag.key}`}
    onClick={onClick}
    name="tag-item"
    type="button"
    key={tag.key}
    value={tag.value.toUpperCase()}
  />
);

TagPill.propTypes = {
  tag: tagShape.isRequired,
  selected: bool,
  onClick: func,
};

TagPill.defaultProps = {
  selected: false,
  onClick: () => {},
};

export default TagPill;
