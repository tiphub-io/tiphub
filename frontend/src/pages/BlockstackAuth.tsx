import React from 'react';
import { Loader, Message } from 'semantic-ui-react';
import { withRouter, RouteComponentProps } from 'react-router';
import * as blockstack from 'blockstack.js';
import { UserData } from 'blockstack.js/lib/auth/authApp';
import api from '../api';

interface State {
  error: string | null;
}

class BlockstackAuth extends React.Component<RouteComponentProps, State> {
  state: State = {
    error: null,
  };

  componentDidMount() {
    if (blockstack.isUserSignedIn()) {
      this.auth(blockstack.loadUserData());
    } else if (blockstack.isSignInPending()) {
      blockstack.handlePendingSignIn().then(this.auth);
    }
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <Message negative>
          <Message.Header>Failed to authenticate with Blockstack</Message.Header>
          <Message.Content>{error}</Message.Content>
        </Message>
      );
    }

    return <Loader size="huge" active>Connecting to Blockstack...</Loader>;
  }

  private auth = (data: UserData) => {
    const { history } = this.props;
    api.blockstackAuth(data).then(res => {
      history.replace('/user/me');
    }).catch(err => {
      this.setState({ error: err.message });
    });
  };
};

export default withRouter(BlockstackAuth);
