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
    <div className="visible" tabIndex="-1" style={{ display: 'block !important' }}>
      { props.tags.map((tag) => {
        if (tag.key === 'dev') {
          return null;
        }
        return (
          <button
            className={tag.key === selectedTag ? ('btn btn-success ${tag.key}' ) : ('btn btn-info' + tag.key)}
            onClick={onChangeTag.bind(this, tag.key)}
            name="tag-item"
            type="button"
            key={tag.key}
            data-value={tag.value}
          >
            {tag.value}
          </button>
        );
      })}
    </div>
  );
}

export default TagsList;
