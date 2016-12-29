import React, { Component } from 'react';
import ComponentContextMenu from './ComponentContextMenu';
import ComponentBox from './ComponentBox';
import ComponentDependencyArrow from './ComponentDependencyArrow';
const DependencyGraph = require('hekla-core').DependencyGraph;
import {
  OFFSET_X,
  OFFSET_Y,
  GRID_X,
  GRID_Y
} from './constants';

import './DependencyChart.css';


export default class DependencyChart extends Component {
  constructor(props) {
    super(props);
    const { components, componentDependencies } = props;
    this._onSelect = this._onSelect.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onClickBackground = this._onClickBackground.bind(this);
    this._onUpdateGraph = this._onUpdateGraph.bind(this);
    this._onUpdateSelectedComponent = this._onUpdateSelectedComponent.bind(this);
    this._onExpandDependants = this._onExpandDependants.bind(this);
    this._onExpandDependencies = this._onExpandDependencies.bind(this);
    this._addComponent = this._addComponent.bind(this);
    this._nextY = 0; // TODO: make this smarter
    this.state = {
      projectGraph: createProjectGraph(components, componentDependencies),
      subgraph: new DependencyGraph(),
      contextMenuComponent: null,
      contextMenuCoordinates: { x: 0, y: 0 }
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.components !== this.props.components) {
      this._onUpdateGraph(newProps.components, newProps.componentDependencies);
    }

    if (newProps.selectedComponent !== this.props.selectedComponent) {
      this._onUpdateSelectedComponent(newProps.selectedComponent);
    }
  }

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

  _onUpdateGraph(components, componentDependencies) {
    this.setState({
      projectGraph: createProjectGraph(components, componentDependencies),
      subgraph: new DependencyGraph()
    });
  }

  _onUpdateSelectedComponent(component) {
    const { subgraph } = this.state;
    if (!subgraph.hasNode(component.id)) {
      // Pick coordinates for the box
      // TODO: decide based on the projectGraph
      const boxX = 0;
      const boxY = this._nextY;
      this._nextY++;
      this._addComponent(component, boxX, boxY);

      // Re-render
      console.log('new subgraph:', subgraph);
      this.forceUpdate();
    }
  }

  _onExpandDependants(component) {
    const { subgraph, projectGraph } = this.state;
    const dependantIds = projectGraph.getLinksTo(component.id)
      .map(link => link.source)
      .filter(id => !subgraph.hasNode(id));
      // TODO: decide coordinates based on the projectGraph
    let boxX = 0;
    const boxY = this._nextY;
    dependantIds.forEach(id => {
      const dependantComponent = projectGraph.getNode(id);
      this._addComponent(dependantComponent, boxX, boxY);
      boxX++;
    });

    // Re-render
    console.log('new subgraph:', subgraph);
    this.forceUpdate();
  }

  _onExpandDependencies(component) {
    const { subgraph, projectGraph } = this.state;
    const dependencyIds = projectGraph.getLinksFrom(component.id)
      .map(link => link.target)
      .filter(id => !subgraph.hasNode(id));
      // TODO: decide coordinates based on the projectGraph
    let boxX = 0;
    const boxY = this._nextY;
    dependencyIds.forEach(id => {
      const dependencyComponent = projectGraph.getNode(id);
      this._addComponent(dependencyComponent, boxX, boxY);
      boxX++;
    });

    // Re-render
    console.log('new subgraph:', subgraph);
    this.forceUpdate();
  }

  _addComponent(component, boxX, boxY) {
    const { subgraph } = this.state;
    // Add the node
    const node = makeNode(component, boxX, boxY);
    subgraph.addNode(component.id, node);

    // Add links to and from other nodes in the current subgraph
    this.state.projectGraph.getLinksFrom(component.id)
      .filter(link => subgraph.hasNode(link.target))
      .forEach(link => subgraph.addLink(link.source, link.target));
    this.state.projectGraph.getLinksTo(component.id)
      .filter(link => subgraph.hasNode(link.source))
      .forEach(link => subgraph.addLink(link.source, link.target));
  }

  _onClickBackground() {
    // Close the context menu
    this.setState({
      contextMenuComponent: null
    });
  }

  render() {
    const { selectedComponent } = this.props;
    const {
      projectGraph,
      subgraph,
      contextMenuComponent,
      contextMenuCoordinates
    } = this.state;
    const subgraphNodes = subgraph.nodes.map(node => node.value);
    const subgraphLinks = subgraph.links;
    return (
      <div ref="container" className="DependencyChart" onClick={this._onClickBackground}>
        {!contextMenuComponent ? null : (
          <ComponentContextMenu
            component={contextMenuComponent}
            projectGraph={projectGraph}
            subgraph={subgraph}
            x={contextMenuCoordinates.x}
            y={contextMenuCoordinates.y}
            onExpandDependants={() => this._onExpandDependants(contextMenuComponent)}
            onExpandDependencies={() => this._onExpandDependencies(contextMenuComponent)}
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
            const { source: sourceId, target: targetId } = link;
            const fromNode = subgraph.getNode(sourceId);
            const toNode = subgraph.getNode(targetId);
            const key = `${sourceId}-${targetId}`;
            return (
              <ComponentDependencyArrow
                key={key}
                fromNode={fromNode}
                toNode={toNode}
              />
            );
          })}
        </svg>
      </div>
    );
  }
};

/**
 * Rebuild the dependency graph that the analyzer created.
 * We will pull items out of this to create the visible subgraph.
 */
function createProjectGraph(components, componentDependencies) {
  const projectGraph = new DependencyGraph();
  components.forEach(component => projectGraph.addNode(component.id, component));
  componentDependencies.forEach(link => projectGraph.addLink(link.source, link.target));
  return projectGraph;
}

function makeNode(component, gridX, gridY) {
  return {
    x: (OFFSET_X + (gridX * GRID_X)),
    y: (OFFSET_Y + (gridY * GRID_Y)),
    component
  };
}
