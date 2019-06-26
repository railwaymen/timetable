import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import TagsList from './tags_list';

class TagsDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeTag = this.onChangeTag.bind(this);
  }

  static propTypes = {
    tags: PropTypes.array,
    selectedTag: PropTypes.string,
  }

  onChangeTag(tag_key) {
    const { tags } = this.props;
    const selectedTagKey = _.find(tags, p => (
      p === tag_key
    )) || tags[0];

    this.props.updateTag(selectedTagKey);
  }

  render() {
    return (
      <TagsList tags={this.props.tags} selectedTag={this.props.selectedTag} onChangeTag={this.onChangeTag} />
    );
  }
}

export default TagsDropdown;
