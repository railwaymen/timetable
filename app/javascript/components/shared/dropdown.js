import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import DropdownList from './dropdown_list';

class Dropdown extends React.Component {
  constructor(props) {
    super(props);

    this.hideDropdown = this.hideDropdown.bind(this);
    this.expandDropdown = this.expandDropdown.bind(this);
    this.renderDropdownList = this.renderDropdownList.bind(this);
    this.onChangeObject = this.onChangeObject.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.searchRef = React.createRef();
  }

  componentDidMount() {
    this.setState({
      filteredObjects: this.filterObjects(),
    });
  }

  static propTypes = {
    objects: PropTypes.array,
    selectedObject: PropTypes.object,
    isExpanded: PropTypes.bool,
    filter: PropTypes.string,
  }

  state = {
    isExpanded: false,
    filter: '',
    filteredObjects: this.filterObjects(''),
  }

  onFilterChange(e) {
    this.setState({
      filter: e.target.value,
      filteredObjects: this.filterObjects(e.target.value),
    });
  }

  onKeyPress(e) {
    const { filteredObjects } = this.state;
    if (e.key === 'Enter' && filteredObjects.length > 0) {
      const objects = this.filterObjects();
      const selectedObject = _.find(objects, p => (
        p.id === filteredObjects[0]
      )) || objects[0];

      this.props.updateObject(selectedObject);
      this.hideDropdown();
    }
  }

  filterObjects(filter = this.state.filter) {
    return this.props.filterObjects(filter);
  }

  hideDropdown(e) {
    if (e && e.target === this.searchRef.current) return; // Do not hide when click is on search input
    document.removeEventListener('click', this.hideDropdown);
    this.setState({ isExpanded: false, filter: '', filteredObjects: this.filterObjects('') });
  }

  expandDropdown() {
    this.setState({ isExpanded: true, filter: '', filteredObjects: this.filterObjects('') }, () => {
      document.addEventListener('click', this.hideDropdown);
    });
  }

  onBlur() {
    this.setState({ isExpanded: false });
  }

  onChangeObject = (e) => {
    const objectId = parseInt(e.target.closest('.object').attributes.getNamedItem('data-value').value, 10);

    if (objectId !== this.props.selectedObject) {
      const objects = this.filterObjects('');
      const selectedObject = _.find(objects, p => (
        p.id === objectId
      )) || objects[0];

      this.hideDropdown();
      this.props.updateObject(selectedObject);
    }
  }

  renderDropdownList() {
    return (
      <div style={{ marginTop: '15px' }}>
        <DropdownList objects={this.state.filteredObjects} currentObject={this.props.selectedObject} onChangeObject={this.onChangeObject} renderObjectsList={this.props.renderObjectsList} />
      </div>
    );
  }

  render() {
    const { isExpanded, filter } = this.state;
    const { selectedObject } = this.props;

    return (
      <div className="dropdown fluid search ui" style={{ minWidth: '90px' }}>
        <input type="hidden" name="object" value="12" />
        <input placeholder={this.props.placeholder} onFocus={this.expandDropdown} ref={this.searchRef} className="form-control input-search" name="filter" value={filter} autoComplete="off" tabIndex="0" onChange={this.onFilterChange} id="search-input" onKeyPress={this.onKeyPress} />
        <div className={`text active ${(isExpanded ? 'hidden' : '')}`} onClick={this.expandDropdown}>
          {this.props.renderSelectedObject(selectedObject)}
        </div>
        { isExpanded ? this.renderDropdownList() : null }
      </div>
    );
  }
}

export default Dropdown;
