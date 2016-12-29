import React, { Component } from 'react';
import { json } from 'd3-request';
import './App.css';

import Header from './Header';
import ContentPane from './ContentPane';
import Sidebar from './Sidebar';

const JSON_URL = '/hekla.json';

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
  }

  render() {
    return (
      <div className="App">

        <div className="header-container">
          <Header />
        </div>

        <div className="content">

          <div className="content-pane-container">
            <ContentPane
              graph={this.state.graph}
              selectedComponent={this.state.selectedNode}
              onSelect={this._onSelectNode}
            />
          </div>

          <div className="sidebar-container">
            <Sidebar
              graph={this.state.graph}
              selectedComponent={this.state.selectedNode}
              onSelect={this._onSelectNode}
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
