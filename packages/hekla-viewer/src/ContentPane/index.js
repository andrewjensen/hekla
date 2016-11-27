import React, { Component } from 'react';

import ComponentSearcher from './ComponentSearcher';
import Graph from './Graph';

import './ContentPane.css';

class ContentPane extends Component {
  render() {
    const { graph, onSelect } = this.props;
    return (
      <div className="ContentPane">
        <ComponentSearcher
          components={graph ? graph.components : []}
          onSelect={onSelect}
        />
        <Graph
          graph={graph}
          onSelect={onSelect}
        />
      </div>
    );
  }
}

export default ContentPane;
