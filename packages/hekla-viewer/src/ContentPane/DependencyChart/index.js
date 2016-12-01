import React, { Component } from 'react';
import ComponentBox from './ComponentBox';
import ComponentDependencyArrow from './ComponentDependencyArrow';

import './DependencyChart.css';

export default class DependencyChart extends Component {
  constructor(props) {
    super(props);
    this._onSelect = this._onSelect.bind(this);
    this.state = {
      subgraph: {}
    };
  }

  /**
   * TODO:
   * Make a subgraph, initialized to empty
   * As components are searched, add them to the graph
   * Eventually this will happen in a state manager
   *
   * On add component:
   * add links between new component and pre-existing components
   */

  _onSelect(component) {
    this.props.onSelect(component);
  }

  render() {
    const { selectedComponent } = this.props;
    const { components } = this.props;
    return (
      <div className="DependencyChart">
        <svg>
          <marker id="triangle"
            viewBox="0 0 10 10" refX="10" refY="5"
            markerUnits="strokeWidth"
            markerWidth="8" markerHeight="6"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <ComponentBox
            x={48}
            y={100}
            component={components[0]}
            selected={selectedComponent === components[0]}
            onSelect={this._onSelect}
          />
          <ComponentBox
            x={48}
            y={200}
            component={components[1]}
            selected={selectedComponent === components[1]}
            onSelect={this._onSelect}
          />
          <ComponentBox
            x={298}
            y={200}
            component={components[3]}
            selected={selectedComponent === components[3]}
            onSelect={this._onSelect}
          />
          <ComponentDependencyArrow
            from={{ x: 148, y: 150 }}
            to={{ x: 148, y: 200 }}
          />
          <ComponentDependencyArrow
            from={{ x: 148, y: 150 }}
            to={{ x: 398, y: 200 }}
          />
        </svg>
      </div>
    );
  }
};
