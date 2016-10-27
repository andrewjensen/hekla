import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';

import PaneTitle from '../../components/PaneTitle';
import ScrollingPane from '../../components/ScrollingPane';

import './ComponentListPane.css';

class ComponentListPane extends Component {
  render() {
    const { graph, onSelect } = this.props;

    return (
      <div className="ComponentListPane">
        <div className="ComponentListPane-title">
          <PaneTitle text="Components" />
        </div>
        <div className="ComponentListPane-content">
          <ScrollingPane>
            {graph ? renderList(graph.components, onSelect) : null}
          </ScrollingPane>
        </div>
      </div>
    );
  }
}

function renderList(components, onSelect) {
  return (
    <List>
      {components.map(c => (
        <ListItem
          key={c.id}
          primaryText={c.name}
          onClick={() => onSelect(c)}
        />
      ))}
    </List>
  );
}

export default ComponentListPane;
