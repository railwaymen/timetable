import React from 'react';
import PropTypes from 'prop-types';

class DropdownList extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeObject = this.onChangeObject.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
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
      <div className="dropdown-menu show p-0" tabIndex="-1" style={{ display: 'block !important' }}>
        { this.props.objects.map((object) => (
          <button
            key={object.id}
            data-value={object.id}
            tabIndex="0"
            className="dropdown-item object"
            onClick={this.onChangeObject}
            onKeyPress={this.handleKeyPress}
            type="button"
          >
            {this.props.renderObjectsList(object, this.props.currentObject)}
          </button>
        )) }
      </div>
    );
  }
}

DropdownList.propTypes = {
  objects: PropTypes.array,
  currentObject: PropTypes.object,
};

export default DropdownList;
