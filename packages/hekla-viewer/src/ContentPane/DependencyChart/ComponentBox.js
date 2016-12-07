import React from 'react';
import {
  COMPONENT_BOX_WIDTH,
  COMPONENT_BOX_HEIGHT,
  COMPONENT_BOX_TEXT_OFFSET
} from './constants';

const ComponentBox = (props) => {
  const {
    x,
    y,
    component,
    selected,
    onSelect,
    onContextMenu
  } = props;
  const { name } = component;
  const className = (selected ? 'ComponentBox selected' : 'ComponentBox');
  return (
    <g className={className} onClick={() => onSelect(component)} onContextMenu={(event) => onContextMenu(event, component)}>
      <rect
        x={x}
        y={y}
        width={COMPONENT_BOX_WIDTH}
        height={COMPONENT_BOX_HEIGHT} />
      <text
        x={x + (COMPONENT_BOX_WIDTH * 0.5)}
        y={y + COMPONENT_BOX_TEXT_OFFSET}
      >{name}</text>
    </g>
  );
};

export default ComponentBox;
