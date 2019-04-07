import React from 'react';
import { Loader } from 'semantic-ui-react';
import { withRouter, RouteComponentProps } from 'react-router';
import * as blockstack from 'blockstack.js';
import { UserData } from 'blockstack.js/lib/auth/authApp';
import api, { User } from '../api';

class BlockstackAuth extends React.Component<RouteComponentProps> {
  componentDidMount() {
    if (blockstack.isUserSignedIn()) {
      this.auth(blockstack.loadUserData());
    } else if (blockstack.isSignInPending()) {
      blockstack.handlePendingSignIn().then(this.auth)
    }
  }

  render() {
    return <Loader size="huge" active>Connecting to Blockstack...</Loader>;
  }

  private auth = (data: UserData) => {
    const { history } = this.props;
    api.blockstackAuth(data).then(res => {
      history.replace('/user/me');
    }).catch(err => {
      alert(err.message);
    });
  };
};

export default withRouter(BlockstackAuth);