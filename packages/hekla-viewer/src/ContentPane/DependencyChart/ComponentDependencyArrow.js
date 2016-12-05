import React from 'react';

const ComponentDependencyArrow = (props) => {
  const { from, to } = props;
  const { x: fromX, y: fromY } = from;
  const { x: toX, y: toY } = to;

  const d = (fromX === toX ?
    `M ${fromX} ${fromY} L ${toX} ${toY}` :
    curvedLinesPath(fromX, fromY, toX, toY)
  );

  return (<path className="ComponentDependencyArrow" d={d} />);
};

export default ComponentDependencyArrow;

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
