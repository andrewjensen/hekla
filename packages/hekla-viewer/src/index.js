import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
 // TODO: replace with official React version once released
import injectTapEventPlugin from 'react-tap-event-plugin';

import App from './App';
import './index.css';

injectTapEventPlugin();

ReactDOM.render((
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>), document.getElementById('root')
);
