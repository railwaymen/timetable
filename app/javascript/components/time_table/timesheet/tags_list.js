import React from 'react';

function TagsList(props) {
  function onChangeTag(tag_key) {
    if (tag_key === props.selectedTag) {
      props.onChangeTag('dev');
    } else {
      props.onChangeTag(tag_key);
    }
  }

  const { selectedTag } = props;

  return (
    <div className="visible" tabIndex="-1">
      { props.tags.map((tag) => {
        if (tag.key === 'dev') {
          return null;
        }
        return (
          <input
            className={tag.key === selectedTag ? `tags selected ${tag.key}` : `tags ${tag.key}`}
            onClick={onChangeTag.bind(this, tag.key)}
            name="tag-item"
            type="button"
            key={tag.key}
            value={tag.value.toUpperCase()}
          />
        );
      })}
    </div>
  );
}

export default TagsList;
