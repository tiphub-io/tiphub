import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { redirectToSignIn } from 'blockstack.js';
import { SelfUser, ConnectionSite, SelfConnection } from '../api';
import { makeBackendUrl, makeConnectionUrl } from '../util/formatters';
import BlockstackIcon from '../images/blockstack.svg';
import './ConnectionsForm.less';

interface Props {
  user: SelfUser;
}

export default class ConnectionsForm extends React.Component<Props> {
  render() {
    const { user } = this.props;
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
            <div className="ConnectionsForm-connection">
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
              <Button icon size="big" color={c ? 'red' : 'grey'} basic disabled={!c}>
                <Icon name="trash" />
              </Button>
            </div>
          );
        })}
      </div>
    )
  }

  private blockstackConnect() {
    redirectToSignIn(`${window.location.origin}/auth/blockstack`);
  }

  private removeConnection = (site: ConnectionSite) => {

  };
}