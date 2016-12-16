import React from 'react';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward';
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward';
import Delete from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';

const OFFSET_X = 5;

const ComponentContextMenu = (props) => {
  const {
    component,
    projectGraph,
    subgraph,
    x,
    y,
    onExpandDependants,
    onExpandDependencies,
    onRemove
  } = props;
  const { id } = component;

  const totalDependantCount = projectGraph.getLinksTo(id).length;
  const visibleDependantCount = subgraph.getLinksTo(id).length;
  const canExpandDependants = (totalDependantCount - visibleDependantCount > 0);

  const totalDependencyCount = projectGraph.getLinksFrom(id).length;
  const visibleDependencyCount = subgraph.getLinksFrom(id).length;
  const canExpandDependencies = (totalDependencyCount - visibleDependencyCount > 0);

  const style = {
    left: (x + OFFSET_X),
    top: y
  };
  return (
    <div className="ComponentContextMenu" style={style}>
      <Paper zDepth={2}>
        <Menu desktop={true}>
          {(canExpandDependants ? (
            <MenuItem
              primaryText={`Expand dependants (${totalDependantCount})`}
              leftIcon={<ArrowUpward />}
              onTouchTap={onExpandDependants}
            />
          ) : null)}
          {(canExpandDependencies ? (
            <MenuItem
              primaryText={`Expand dependencies (${totalDependencyCount})`}
              leftIcon={<ArrowDownward />}
              onTouchTap={onExpandDependencies}
            />
          ) : null)}
          {(canExpandDependants && canExpandDependencies) ? (
            <Divider />
          ) : null}
          <MenuItem
            primaryText="Remove"
            leftIcon={<Delete />}
            onTouchTap={onRemove}
          />
        </Menu>
      </Paper>
    </div>
  );
};
export default ComponentContextMenu
