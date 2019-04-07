import React from 'react';
import { Switch, Route } from 'react-router';
import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
import Template from './components/Template';

export default class App extends React.Component {
  render() {
    return (
      <Template>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/user/:userid/config" component={ProfileSetup} />
          <Route path="*" render={() => '404'} />
        </Switch>
      </Template>
    )
  }
}
