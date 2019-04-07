import { SemanticICONS } from 'semantic-ui-react';
import { ConnectionSite, Connection } from '../api';

export const CONNECTION_UI = {
  [ConnectionSite.github]: {
    name: 'GitHub',
    color: '#333',
    icon: 'github' as SemanticICONS,
    url: (c: Connection) => `https://github.com/${c.site_username}`,
    img: (c: Connection) => `https://github.com/${c.site_username}.png`,
  },
  [ConnectionSite.gitlab]: {
    name: 'GitLab',
    color: '#fc6d26',
    icon: 'gitlab' as SemanticICONS,
    url: (c: Connection) => `https://gitlab.com/${c.site_username}`,
    img: (_: Connection) => 'https://assets.gitlab-static.net/assets/touch-icon-iphone-retina-72e2aadf86513a56e050e7f0f2355deaa19cc17ed97bbe5147847f2748e5a3e3.png',
  },
  [ConnectionSite.blockstack]: {
    name: 'Blockstack',
    color: '#3700ff',
    icon: 'block layout' as SemanticICONS,
    url: (_: Connection) => `https://browser.blockstack.org`,
    img: (c: Connection) => `https://gaia.blockstack.org/hub/${c.site_id}//avatar-0`, // not a typo, two slashes
  },
}
