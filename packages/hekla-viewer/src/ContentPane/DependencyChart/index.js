import React, { Component } from 'react';
import ComponentContextMenu from './ComponentContextMenu';
import ComponentBox from './ComponentBox';
import ComponentDependencyArrow from './ComponentDependencyArrow';

import './DependencyChart.css';

export default class DependencyChart extends Component {
  constructor(props) {
    super(props);
    this._onSelect = this._onSelect.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onClickBackground = this._onClickBackground.bind(this);
    this.state = {
      subgraph: {},
      contextMenuComponent: null,
      contextMenuCoordinates: { x: 0, y: 0 }
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

  _onContextMenu(event, component) {
    const containerOffsets = this.refs.container.getBoundingClientRect();
    const x = (event.clientX - containerOffsets.left);
    const y = (event.clientY - containerOffsets.top);
    event.preventDefault();
    this.setState({
      contextMenuComponent: component,
      contextMenuCoordinates: { x, y }
    });
  }

  _onClickBackground() {
    // Close the context menu
    this.setState({
      contextMenuComponent: null
    });
  }

  render() {
    const { components, selectedComponent } = this.props;
    const { contextMenuComponent, contextMenuCoordinates } = this.state;
    return (
      <div ref="container" className="DependencyChart" onClick={this._onClickBackground}>
        {!contextMenuComponent ? null : (
          <ComponentContextMenu
            component={contextMenuComponent}
            x={contextMenuCoordinates.x}
            y={contextMenuCoordinates.y}
            onExpandDependants={() => console.log('expand dependants!')}
            onExpandDependencies={() => console.log('expand dependencies!')}
            onRemove={() => console.log('remove!')}
          />
        )}
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
            onContextMenu={this._onContextMenu}
          />
          <ComponentBox
            x={48}
            y={200}
            component={components[1]}
            selected={selectedComponent === components[1]}
            onSelect={this._onSelect}
            onContextMenu={this._onContextMenu}
          />
          <ComponentBox
            x={298}
            y={200}
            component={components[3]}
            selected={selectedComponent === components[3]}
            onSelect={this._onSelect}
            onContextMenu={this._onContextMenu}
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
