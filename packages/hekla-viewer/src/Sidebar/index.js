import React, { Component } from 'react';
import './Sidebar.css';

import ScrollingPane from '../components/ScrollingPane';

class Sidebar extends Component {
  render() {
    const { graph, node } = this.props;
    const nodeName = node ? node.name : 'Details';

    return (
      <div className="Sidebar">
        <ScrollingPane>
          <div className="Sidebar-content">
            <h2>Components</h2>

            {graph ? graph.components.map(c => (<div key={c.id}>{c.name}</div>)) : null}

            <h2>{nodeName}</h2>
          </div>
        </ScrollingPane>
      </div>
    );
  }
}

export default Sidebar;
