import React from 'react';
import { Switch, Route } from 'react-router';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import BlockstackAuth from './pages/BlockstackAuth';
import Tip from './pages/Tip';
import Template from './components/Template';

export default class App extends React.Component {
  render() {
    return (
      <Template>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/user/setup" component={ProfileSetup} />
          <Route path="/user/:userid/tip" component={Tip} />
          <Route path="/user/:userid" component={Profile} />
          <Route path="/auth/blockstack" component={BlockstackAuth} />
          <Route path="*" render={() => '404'} />
        </Switch>
      </Template>
    )
  }
}
