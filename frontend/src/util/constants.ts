import { ConnectionSite } from '../api';

export const CONNECTION_UI = {
  [ConnectionSite.github]: {
    name: 'GitHub',
    color: '#333',
    url: (name: string) => `https://github.com/${name}`,
    img: (name: string) => `https://github.com/${name}.png`,
  },
  [ConnectionSite.gitlab]: {
    name: 'GitLab',
    color: '#fc6d26',
    url: (name: string) => `https://gitlab.com/${name}`,
    img: (_: string) => 'https://assets.gitlab-static.net/assets/touch-icon-iphone-retina-72e2aadf86513a56e050e7f0f2355deaa19cc17ed97bbe5147847f2748e5a3e3.png',
  },
}
