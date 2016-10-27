import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

import './Header.css';

class Header extends Component {
  render() {
    return (
      <AppBar
        title="Dependency Viewer"
        showMenuIconButton={false}
        iconElementRight={null}
      />
    );
  }
}

export default Header;
