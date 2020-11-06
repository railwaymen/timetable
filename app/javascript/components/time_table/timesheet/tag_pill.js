import React from 'react';
import { func, bool, string } from 'prop-types';

const classNames = require('classnames');

const TagPill = ({
  tag, selected, onClick, bold = true,
}) => (
  <input
    className={classNames({
      tags: true, clickable: true, selected, bolded: bold,
    })}
    onClick={onClick}
    name="tag-item"
    type="button"
    key={tag}
    value={tag}
  />
);

TagPill.propTypes = {
  tag: string,
  selected: bool,
  onClick: func,
};

TagPill.defaultProps = {
  selected: false,
  onClick: () => {},
};

export default TagPill;
