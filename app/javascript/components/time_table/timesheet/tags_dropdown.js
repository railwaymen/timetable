import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import TagsList from './tags_list';

class TagsDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.renderTagsList = this.renderTagsList.bind(this);
    this.onChangeTag = this.onChangeTag.bind(this);
  }

  static propTypes = {
    tags: PropTypes.array,
    selectedTag: PropTypes.string,
  }

  onChangeTag(tag_key) {
    const { tags } = this.props;
    const selectedTagObj = _.find(tags, p => (
      p.key === tag_key
    )) || tags[0];

    this.props.updateTag(selectedTagObj);
  }

  renderTagsList() {
    return (
      <TagsList tags={this.props.tags} selectedTag={this.props.selectedTag} onChangeTag={this.onChangeTag} />
    );
  }

  render() {
    return (
      <div style={{ minWidth: '150px' }}>
        { this.renderTagsList() }
      </div>
    );
  }
}

export default TagsDropdown;