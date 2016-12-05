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
    x,
    y,
    onExpandDependants,
    onExpandDependencies,
    onRemove
  } = props;
  const style = {
    left: (x + OFFSET_X),
    top: y
  };
  return (
    <div className="ComponentContextMenu" style={style}>
      <Paper zDepth={2}>
        <Menu desktop={true}>
          <MenuItem
            primaryText="Expand dependants"
            leftIcon={<ArrowUpward />}
            onTouchTap={onExpandDependants}
          />
          <MenuItem
            primaryText="Expand dependencies"
            leftIcon={<ArrowDownward />}
            onTouchTap={onExpandDependencies}
          />
          <Divider />
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
