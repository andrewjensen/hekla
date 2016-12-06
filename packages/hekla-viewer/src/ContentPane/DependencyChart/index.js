import React, { Component } from 'react';
import ComponentContextMenu from './ComponentContextMenu';
import ComponentBox from './ComponentBox';
import ComponentDependencyArrow from './ComponentDependencyArrow';
const DependencyGraph = require('hekla-core').DependencyGraph;

import './DependencyChart.css';

const OFFSET_X = 48;
const OFFSET_Y = 100;
const GRID_X = 250;
const GRID_Y = 100;

export default class DependencyChart extends Component {
  constructor(props) {
    super(props);
    this._onSelect = this._onSelect.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onClickBackground = this._onClickBackground.bind(this);
    this._onUpdateSelectedComponent = this._onUpdateSelectedComponent.bind(this);
    this._nextY = 0; // TODO: make this smarter
    this.state = {
      subgraph: new DependencyGraph(),
      contextMenuComponent: null,
      contextMenuCoordinates: { x: 0, y: 0 }
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.selectedComponent !== this.props.selectedComponent) {
      this._onUpdateSelectedComponent(newProps.selectedComponent);
    }
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

  _onUpdateSelectedComponent(component) {
    const { subgraph } = this.state;
    if (!subgraph.hasNode(component.id)) {
      // Add the node
      // Pick coordinates for the box
      const boxX = 0;
      const boxY = this._nextY;
      this._nextY++;
      const node = makeNode(component, boxX, boxY);
      subgraph.addNode(component.id, node);

      // Add links to and from other nodes in the current subgraph
      // TODO: implement

      // Re-render
      console.log('new subgraph:', subgraph);
      this.forceUpdate();
    }
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
    const subgraphNodes = this.state.subgraph.nodes.map(node => node.value);
    const subgraphLinks = this.state.subgraph.links;
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
          {subgraphNodes.map(node => (
            <ComponentBox
              key={node.component.id}
              x={node.x}
              y={node.y}
              component={node.component}
              selected={selectedComponent === node.component}
              onSelect={this._onSelect}
              onContextMenu={this._onContextMenu}
            />
          ))}
          {subgraphLinks.map(link => {
            const { fromNode, toNode } = link;
            const key = `${fromNode.component.id}-${toNode.component.id}`;
            return (
              <ComponentDependencyArrow
                key={key}
                from={{ x: fromNode.x, y: fromNode.y }}
                to={{ x: toNode.x, y: toNode.y }}
              />
            );
          })}
        </svg>
      </div>
    );
  }
};

function makeNode(component, gridX, gridY) {
  return {
    x: (OFFSET_X + (gridX * GRID_X)),
    y: (OFFSET_Y + (gridY * GRID_Y)),
    component
  };
}

function makeLink(fromNode, toNode) {
  return {
    fromNode,
    toNode
  };
}
