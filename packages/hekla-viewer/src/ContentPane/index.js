import React, { Component } from 'react';

import Graph from './Graph';

import './ContentPane.css';

class ContentPane extends Component {
  render() {
    const { graph, onSelect } = this.props;
    return (
      <div className="ContentPane">
        <Graph
          graph={graph}
          onSelect={onSelect}
        />
      </div>
    );
  }
}

export default ContentPane;
