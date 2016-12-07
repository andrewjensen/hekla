import React from 'react';
import {
  COMPONENT_BOX_WIDTH,
  COMPONENT_BOX_HEIGHT
} from './constants';

const ComponentDependencyArrow = (props) => {
  const { fromNode, toNode } = props;

  const fromX = (fromNode.x + (COMPONENT_BOX_WIDTH * 0.5));
  const fromY = (fromNode.y <= toNode.y ?
    (fromNode.y + COMPONENT_BOX_HEIGHT) : // Bottom of node
    (fromNode.y) // Top of node
  );

  const toX = (toNode.x + (COMPONENT_BOX_WIDTH * 0.5));
  const toY = (fromNode.y <= toNode.y ?
    (toNode.y) : // Top of node
    (toNode.y + COMPONENT_BOX_HEIGHT) // Bottom of node
  );

  const d = (fromX === toX ?
    directPath(fromX, fromY, toX, toY) :
    curvedLinesPath(fromX, fromY, toX, toY)
  );

  return (<path className="ComponentDependencyArrow" d={d} />);
};

export default ComponentDependencyArrow;

function directPath(fromX, fromY, toX, toY) {
  return `M ${fromX} ${fromY} L ${toX} ${toY}`;
}

// function straightLinesPath(fromX, fromY, toX, toY) {
//   const middleY = (fromY + toY) * 0.5;
//   return `\
//     M ${fromX} ${fromY} \
//     L ${fromX} ${middleY} \
//     L ${toX} ${middleY} \
//     L ${toX} ${toY}`;
// }

function curvedLinesPath(fromX, fromY, toX, toY) {
  const middleX = (fromX + toX) * 0.5;
  const middleY = (fromY + toY) * 0.5;
  const ctrlY = fromY + ((toY - fromY) * 0.4);
  return `\
    M ${fromX} ${fromY} \
    Q ${fromX} ${ctrlY} ${middleX} ${middleY} \
    T ${toX} ${toY}`;
}
