import React, { Component } from 'react';
import './Sidebar.css';

import ComponentDetailsPane from './ComponentDetailsPane';

class Sidebar extends Component {
  render() {
    const { selectedComponent } = this.props;

    return (
      <div className="Sidebar">
        <div className="details-container">
          <ComponentDetailsPane
            component={selectedComponent}
          />
        </div>
      </div>
    );
  }
}

export default Sidebar;
