import React, { Component } from 'react';
import './ScrollingPane.css';

class ScrollingPane extends Component {
  render() {
    return (
      <div className="ScrollingPane">
        <div className="ScrollingPane-contents">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default ScrollingPane;
