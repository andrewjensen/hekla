import React, { Component } from 'react';

import PaneTitle from '../../components/PaneTitle';
import ScrollingPane from '../../components/ScrollingPane';

import './ComponentDetailsPane.css';

class ComponentDetailsPane extends Component {
  render() {
    const { node } = this.props;

    if (node) {
      return (
        <div className="ComponentDetailsPane">
          <div className="ComponentDetailsPane-title">
            <PaneTitle text={node.name} />
          </div>
          <div className="ComponentDetailsPane-content">
            <ScrollingPane>
              <pre>{JSON.stringify(node, null, 2)}</pre>
            </ScrollingPane>
          </div>
        </div>
      );
    } else {
      return (
        <div className="ComponentDetailsPane">
          <div className="ComponentDetailsPane-title">
            <PaneTitle text="Select a component" />
          </div>
          <div className="ComponentDetailsPane-content"></div>
        </div>
      );
    }

  }
}

export default ComponentDetailsPane;
