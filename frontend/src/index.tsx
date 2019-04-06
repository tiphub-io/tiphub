import React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';

const App = hot(module)(() => (
  <div className="App">
    <h1>Sup</h1>
  </div>
));

render(<App />, document.getElementById('root'));
