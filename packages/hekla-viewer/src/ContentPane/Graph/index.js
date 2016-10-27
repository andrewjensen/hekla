import React, { Component } from 'react';
// import { max } from 'd3-array';
import { select, event } from 'd3-selection';
import { drag } from 'd3-drag';
// import { scaleLinear } from 'd3-scale';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  // forceCenter,
  forceX,
  // forceY
} from 'd3-force';

// const debounce = require('lodash.debounce/index');
import debounce from 'lodash.debounce';

import './Graph.css';

const CIRCLE_RADIUS = 14;
// const FRAME_PADDING = 30;

class Graph extends Component {
  _graphRendered = false;
  _resizeListener = null;

  componentDidMount() {
    this.resizeSvgElement();
    this._resizeListener = debounce(this._onDocumentResize, 100).bind(this);
    window.addEventListener('resize', this._resizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener(this._resizeListener);
  }

  componentWillReceiveProps(props) {
    const { graph: { components, componentDependencies } } = props;

    if (!this._graphRendered) {
      this.resizeSvgElement();
      this.renderGraph(components, componentDependencies);
      this._graphRendered = true;
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  _onDocumentResize(event) {
    this.resizeSvgElement();
  }

  resizeSvgElement() {
    const { containerEl, svgEl } = this.refs;
    const width = containerEl.offsetWidth;
    const height = containerEl.offsetHeight;
    select(svgEl)
      .attr('width', width)
      .attr('height', height);
  }

  render() {
    return (
      <div className="Graph" ref="containerEl">

        <svg ref="svgEl">
          <marker id="triangle"
            viewBox="0 0 10 10" refX="35" refY="5"
            markerUnits="strokeWidth"
            markerWidth="8" markerHeight="6"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="300%" height="300%">
              <feOffset result="offOut" in="SourceAlpha" dx="3" dy="4" />
              <feGaussianBlur result="blurOut" in="offOut" stdDeviation="6" />
              <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
            </filter>
          </defs>
        </svg>

      </div>
    );
  }

  renderGraph(nodes, links) {
    console.log(`Render graph: ${nodes.length} nodes, ${links.length} links`);

    const { containerEl, svgEl } = this.refs;
    const svg = select(svgEl);

    // const levelScale = scaleLinear()
    //   .domain([0, max(nodes, d => d.level)])
    //   .range([FRAME_PADDING, height - FRAME_PADDING]);

    const simulation = forceSimulation()
      .force('link', forceLink().id(d => d.id).distance(60))
      .force('charge', forceManyBody().strength(-400).distanceMax(500))
      .force('centerX', forceX(containerEl.offsetWidth / 2).strength(0.05))
      // .force('levelY', forceY().y(d => levelScale(d.level)).strength(0.2));

    var link = svg.append('g')
        .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
        .attr('stroke-width', 1)
        .attr('marker-end', 'url(#triangle)');

    var node = svg.append('g')
        .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
        .attr('r', CIRCLE_RADIUS)
        .attr('fill', (d) => getFill(d))
        .call(drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

    node.on('click', (d) => this.props.onSelect(d));

    node.append('title')
      .text(d => d.name);

    simulation
      .nodes(nodes)
      .on('tick', ticked);

    simulation.force('link')
      .links(links);

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    }

    function dragstarted(d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function getFill(node) {
      return '#303F9F';
    }
  }

}

export default Graph;
