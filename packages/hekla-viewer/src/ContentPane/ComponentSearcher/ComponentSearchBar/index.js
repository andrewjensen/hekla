import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import ActionSearch from 'material-ui/svg-icons/action/search';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import './ComponentSearchBar.css';

export default class ComponentSearchBar extends Component {
  constructor(props) {
    super(props);
    this._onSearchTextChange = this._onSearchTextChange.bind(this);
    this._onClickClose = this._onClickClose.bind(this);
  }

  _onSearchTextChange(event) {
    const updatedText = event.target.value;
    this.props.onSearchTextChange(updatedText);
  }

  _onClickClose() {
    this.props.onSearchTextChange('');
  }

  render() {
    const { searchText } = this.props;
    return (
      <div className="ComponentSearchBar">
        <ActionSearch
          className="icon search"
        />
        <div className="input">
          <TextField
            value={searchText}
            onChange={this._onSearchTextChange}
            hintText="Search for a component..."
            fullWidth={true}
            underlineShow={false}
          />
        </div>
        <NavigationClose
          className="icon close"
          onClick={this._onClickClose}
        />
      </div>
    );
  }
};
