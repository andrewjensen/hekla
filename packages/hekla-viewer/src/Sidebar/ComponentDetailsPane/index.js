import React, { Component } from 'react';

import PaneTitle from '../../components/PaneTitle';
import ScrollingPane from '../../components/ScrollingPane';

import './ComponentDetailsPane.css';

class ComponentDetailsPane extends Component {
  render() {
    const { component } = this.props;

    if (component) {
      return (
        <div className="ComponentDetailsPane">
          <div className="ComponentDetailsPane-title">
            <PaneTitle text={component.name} />
          </div>
          <div className="ComponentDetailsPane-content">
            <ScrollingPane>
              <pre>{JSON.stringify(component, null, 2)}</pre>
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
