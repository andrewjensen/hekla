import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

import './Header.css';

const SearchBar = () => (
  <div>Hello</div>
);

class Header extends Component {
  render() {
    return (
      <AppBar
        title="Dependency Viewer"
        iconElementRight={<SearchBar />}
      />
    );
  }
}

export default Header;
