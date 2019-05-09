import React from 'react';
import { Button, Icon, Message, Modal } from 'semantic-ui-react';
import { redirectToSignIn } from 'blockstack.js';
import api, { SelfUser, ConnectionSite, SelfConnection } from '../api';
import { makeBackendUrl, makeConnectionUrl } from '../util/formatters';
import { CONNECTION_UI } from '../util/constants';
import BlockstackIcon from '../images/blockstack.svg';
import './ConnectionsForm.less';

interface Props {
  user: SelfUser;
}

interface State {
  siteToRemove: null | ConnectionSite;
  error: null | string;
}

export default class ConnectionsForm extends React.Component<Props, State> {
  state: State = {
    siteToRemove: null,
    error: null,
  };

  render() {
    const { user } = this.props;
    const { error, siteToRemove } = this.state;
    const cmap = user.connections.reduce((prev, c) => {
      prev[c.site] = c;
      return prev;
    }, {} as { [key in ConnectionSite]: SelfConnection });
    const buttons = [{
      site: ConnectionSite.github,
      text: 'Connect GitHub account',
      color: 'black',
      icon: <Icon name="github" />,
    }, {
      site: ConnectionSite.gitlab,
      text: 'Connect GitLab account',
      color: 'orange',
      icon: <Icon name="gitlab" />,
    }, {
      site: ConnectionSite.blockstack,
      text: 'Connect Blockstack identity',
      color: 'purple',
      icon: <img src={BlockstackIcon} className="ConnectionsForm-connection-icon" />,
      onClick: cmap[ConnectionSite.blockstack] ? undefined : this.blockstackConnect,
    }];

    return (
      <div className="ConnectionsForm">
        {error &&
          <Message negative>
            <Message.Header>Something went wrong</Message.Header>
            <p>{error}</p>
          </Message>
        }

        {buttons.map(b => {
          const c = cmap[b.site];
          let onClick = b.onClick;
          let href, target;

          if (c) {
            href = makeConnectionUrl(c);
            target = '_blank';
          } else if (onClick) {
            onClick = b.onClick;
          } else {
            href = makeBackendUrl(`/oauth/${b.site}/login`);
          }

          return (
            <div className="ConnectionsForm-connection" key={b.site}>
              <Button
                key={b.site}
                onClick={onClick}
                href={href}
                target={target}
                color={b.color as any}
                size="big"
                fluid
              >
                {b.icon} {c ? c.site_username : b.text}
              </Button>
              <Button
                icon
                size="big"
                color={c ? 'red' : 'grey'}
                basic
                disabled={!c}
                onClick={c ? () => this.openRemoveModal(c.site) : undefined}
              >
                <Icon name="trash" />
              </Button>
            </div>
          );
        })}

        <p className="ConnectionsForm-hint">
          Removing all connections will delete your account
        </p>

        <Modal size="tiny" open={!!siteToRemove} onClose={this.closeRemoveModal}>
          <Modal.Header>Remove connection</Modal.Header>
          <Modal.Content>
            {siteToRemove && (
              <>
                <p>
                  Are you sure you want to remove your connection to{' '}
                  <strong>{CONNECTION_UI[siteToRemove].name}</strong>?
                  You will not be able to log in using this connection anymore,
                  and users will no longer be able to search for you with it.
                </p>
                {user.connections.length === 1 ? (
                  <Message warning>
                    <Message.Header>
                      You are removing your last connection
                    </Message.Header>
                    <p>
                      This will delete your account. You will lose all history
                      of your tips, and all of your tip buttons will stop
                      functioning. You can always make a new account, but
                      your old tip buttons will not update with the new account.
                    </p>
                    <p>
                      <strong>This is irreversible.</strong>
                      {' '}Are you sure you want to continue?
                    </p>
                  </Message>
                ) : (
                  <p>
                    You can always add the connection back later.
                  </p>
                )}
              </>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button content="Cancel" onClick={this.closeRemoveModal} />
            <Button
              content="Yes, remove it"
              negative
              icon="check"
              labelPosition="right"
              onClick={this.removeConnection}
            />
          </Modal.Actions>
        </Modal>
      </div>
    )
  }

  private blockstackConnect() {
    redirectToSignIn(`${window.location.origin}/auth/blockstack`);
  }

  private openRemoveModal = (site: ConnectionSite) => {
    this.setState({ siteToRemove: site });
  };

  private closeRemoveModal = () => {
    this.setState({ siteToRemove: null });
  };

  private removeConnection = () => {
    const { siteToRemove } = this.state;
    if (!siteToRemove) return;

    this.setState({ error: null });
    api.removeConnection(siteToRemove).then(() => {
      // TODO: Update state & user object instead!
      window.location.reload();
    }).catch(err => {
      this.setState({
        siteToRemove: null,
        error: err.message,
      });
    });
  };
}