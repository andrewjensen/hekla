import React, { Component } from 'react';
import { json } from 'd3-request';
import './App.css';

import Header from './header/Header';
import Graph from './graph/Graph';
import Details from './details/Details';

const JSON_URL = 'http://localhost:8081/dependencies.json';

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loaded: false,
      graph: null,
      selectedNode: null
    };

    this._onSelectNode = this._onSelectNode.bind(this);
  }

  componentDidMount() {
    json(JSON_URL, (err, data) => {
      this.setState({
        loaded: true,
        graph: data
      });
    });
    console.log('did mount', this);
  }

  render() {
    return (
      <div className="App">

        <div className="header-container">
          <Header />
        </div>

        <div className="content">

          <div className="graph-container">
            <Graph
              graph={this.state.graph}
              onSelect={this._onSelectNode}
            />
          </div>

          <div className="details-container">
            <Details
              node={this.state.selectedNode}
            />
          </div>

        </div>

      </div>
    );
  }

  _onSelectNode(node) {
    this.setState({
      selectedNode: node
    });
  }

}

export default App;
