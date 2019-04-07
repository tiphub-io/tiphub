import React from 'react';
import { User } from '../api';
import { Placeholder, Icon, Button } from 'semantic-ui-react';
import { CONNECTION_UI } from '../util/constants';
import './ProfileHeader.less';

interface Props {
  user?: User;
}

export default class ProfileHeader extends React.Component<Props> {
  render() {
    const { user } = this.props;

    let image, info;
    if (user) {
      const primaryConnection = user.connections[0];
      image = <img src={CONNECTION_UI[primaryConnection.site].img(primaryConnection)} />;
      info = (
        <>
          <div className="ProfileHeader-info-name">
            {primaryConnection.site_username}
          </div>
          <div className="ProfileHeader-info-pubkey">
            <code>{user.pubkey}</code>
          </div>
          <div className="ProfileHeader-info-connections">
            {user.connections.map(c => (
              <Button
                size="tiny"
                href={CONNECTION_UI[c.site].url(c)}
                target="_blank"
                basic
              >
                <Icon name={CONNECTION_UI[c.site].icon} /> {c.site_username}
              </Button>
            ))}
          </div>
        </>
      );
    }
    else {
      image = <Placeholder><Placeholder.Image /></Placeholder>;
      info = (
        <Placeholder>
          <Placeholder.Line length="long" />
          <Placeholder.Line length="very long" />
          <Placeholder.Line length="short" />
        </Placeholder>
      );
    }

    return (
      <div className="ProfileHeader">
        <div className="ProfileHeader-image">
          {image}
        </div>
        <div className="ProfileHeader-info">
          {info}
        </div>
      </div>
    );
  }
}
