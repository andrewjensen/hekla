import React from 'react';

const ComponentBox = (props) => {
  const {
    x,
    y,
    component,
    selected,
    onSelect
  } = props;
  const { name } = component;
  const width = 200;
  const height = 50;
  const textOffset = 30;
  const className = (selected ? 'ComponentBox selected' : 'ComponentBox');
  return (
    <g className={className} onClick={() => onSelect(component)}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height} />
      <text
        x={x + (width * 0.5)}
        y={y + textOffset}
      >{name}</text>
    </g>
  );
};

export default ComponentBox;
