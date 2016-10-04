import React, { Component } from 'react';
import './Details.css';

class Details extends Component {
  render() {
    const { node } = this.props;
    const nodeName = node ? node.name : 'Details';
    return (
      <div className="Details">
        <h2>{nodeName}</h2>
      </div>
    );
  }
}

export default Details;
