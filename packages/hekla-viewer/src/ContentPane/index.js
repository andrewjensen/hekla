import React, { Component } from 'react';

import ComponentSearcher from './ComponentSearcher';
import DependencyChart from './DependencyChart';

import './ContentPane.css';

class ContentPane extends Component {
  render() {
    const { graph, selectedComponent, onSelect } = this.props;
    return (
      <div className="ContentPane">
        <ComponentSearcher
          components={graph ? graph.components : []}
          onSelect={onSelect}
        />
        {!graph ? null : (
          <DependencyChart
            components={graph.components}
            componentDependencies={graph.componentDependencies}
            selectedComponent={selectedComponent}
            onSelect={onSelect}
          />
        )}
      </div>
    );
  }
}

export default ContentPane;
