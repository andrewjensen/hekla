import React from 'react';

import './ComponentSearchResults.css';

const renderResultItem = (component, onSelect) => (
  <div
    key={component.name + ' ' + component.path}
    className="ComponentSearchResultItem"
    onClick={() => onSelect(component)}
  >
    <div className="name">{component.name}</div>
    <div className="path">{component.path}</div>
    <div className="type">{component.type}</div>
  </div>
);

const ComponentSearchResults = (props) => (
  <div className="ComponentSearchResults">
    <div className="content">
      {props.results.map(component => renderResultItem(component, props.onSelect))}
    </div>
  </div>
);

export default ComponentSearchResults;
