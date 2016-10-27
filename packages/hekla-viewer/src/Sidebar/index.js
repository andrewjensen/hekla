import React, { Component } from 'react';
import './Sidebar.css';

import ComponentListPane from './ComponentListPane';
import ComponentDetailsPane from './ComponentDetailsPane';

class Sidebar extends Component {
  render() {
    const { graph, selectedNode, onSelect } = this.props;

    return (
      <div className="Sidebar">

        <div className="list-container">
          <ComponentListPane
            graph={graph}
            selectedNode={selectedNode}
            onSelect={onSelect}
          />
        </div>

        <div className="details-container">
          <ComponentDetailsPane
          node={selectedNode}
          />
        </div>
      </div>
    );
  }
}

export default Sidebar;
