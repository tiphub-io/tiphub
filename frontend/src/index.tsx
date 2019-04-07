// Style dependencies first so our styles override them
import './style/semantic-ui-theme.css';
import './style/index.less';

import React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import App from './App';

const history = createBrowserHistory();

const Container = hot(module)(() => (
  <Router history={history}>
    <App />
  </Router>
));

render(
  <Container />,
  document.getElementById('root'),
);
