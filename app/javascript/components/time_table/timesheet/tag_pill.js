import React from 'react';
import { func, bool, string } from 'prop-types';

const classNames = require('classnames');

const TagPill = ({
  tag, selected, onClick, bold = true,
}) => (
  <input
    className={classNames(tag, {
      tags: true, clickable: true, selected, bolded: bold,
    })}
    onClick={onClick}
    name="tag-item"
    type="button"
    key={tag}
    value={I18n.t(`apps.tag.${tag}`).toUpperCase()}
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
