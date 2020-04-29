import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeGetRequest } from '../../shared/api';

export default class TypesSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { types: [] };
  }

  componentDidMount() {
    makeGetRequest({ url: '/api/hardwares/types' }).then((response) => {
      this.setState({ types: response.data.types });
    });
  }

  render() {
    const { changeType, selected } = this.props;
    return (
      <select
        name="type"
        onChange={changeType}
        value={selected}
        className="form-control"
      >
        <option value="" />
        {this.state.types.map(
          (type) => (
            <option key={type} value={type}>
              {I18n.t(`apps.hardware.types.${type}`)}
            </option>
          )
          ,
        )}
      </select>
    );
  }
}
TypesSelect.propTypes = {
  selected: PropTypes.string.isRequired,
  changeType: PropTypes.func.isRequired,
};
