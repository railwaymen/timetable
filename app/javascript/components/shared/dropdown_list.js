import React from 'react';
import PropTypes from 'prop-types';

class DropdownList extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeObject = this.onChangeObject.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  static propTypes = {
    objects: PropTypes.array,
    currentObject: PropTypes.object,
  }

  onChangeObject(e) {
    this.props.onChangeObject(e);
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === 'Spacebar') {
      this.onChangeObject(event);
    }
  }

  render() {
    return (
      <div className="menu transition visible" tabIndex="-1" style={{ display: 'block !important' }}>
        { this.props.objects.map(object => (
          <div key={object.id} data-value={object.id} tabIndex="0" className="item object" onClick={this.onChangeObject} onKeyPress={this.handleKeyPress}>
            {this.props.renderObjectsList(object, this.props.currentObject)}
          </div>
        )) }
      </div>
    );
  }
}

export default DropdownList;
