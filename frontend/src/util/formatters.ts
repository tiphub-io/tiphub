import { Connection, ConnectionSite } from '../api';

export function makeBackendUrl(path: string) {
  return `${process.env.BACKEND_URL || ''}${path}`;
}

export function makeConnectionUrl(c: Connection): string {
  const urls = {
    [ConnectionSite.github]: `https://github.com/${c.site_username}`,
    [ConnectionSite.gitlab]: `https://gitlab.com/${c.site_username}`,
    [ConnectionSite.blockstack]: `https://gaia.blockstack.org/hub/${c.site_id}/profile.json`,
  };
  return urls[c.site];
}

export function blobToString(blob: Blob, format: 'hex' | 'base64'): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          const str = Buffer.from(reader.result as string, 'binary').toString(format)
          resolve(str);
        } else {
          reject(new Error('File could not be read'));
        }
      });
      reader.readAsBinaryString(blob);
    } catch(err) {
      reject(err);
    }
  });
}