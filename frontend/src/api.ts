import { stringify } from 'query-string';
import env from './util/env';

export enum ConnectionSite {
  github = 'github',
  gitlab = 'gitlab',
}

export interface Connection {
  site: ConnectionSite;
  site_username: string;
}

export interface SelfConnection extends Connection {
  site_id: string;
  date_created: string;
}

export interface User {
  id: number;
  pubkey: string;
  connections: Connection[];
}

export interface SelfUser extends User {
  date_created: string;
  email: string;
  macaroon: string;
  cert: string;
  node_url: string;
  connections: SelfConnection[];
}

class API {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  // Public methods
  getSelf() {
    return this.request<SelfUser>('GET', '/users/me');
  }

  getUser(id: number) {
    return this.request<User>('GET', `/users/${id}`);
  }

  updateUser(id: number, args: Partial<SelfUser>) {
    return this.request<SelfUser>('PUT', `/users/${id}`, args);
  }

  // Internal fetch function
  protected request<R extends object>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    args?: object,
  ): Promise<R> {
    let body = null;
    let query = '';
    const headers = new Headers();
    headers.append('Accept', 'application/json');

    if (method === 'POST' || method === 'PUT') {
      body = JSON.stringify(args);
      headers.append('Content-Type', 'application/json');
    }
    else if (args !== undefined) {
      // TS Still thinks it might be undefined(?)
      query = `?${stringify(args as any)}`;
    }

    console.log(this.url);
    return fetch(this.url + path + query, {
      method,
      headers,
      body,
      credentials: 'include',
    })
    .then(async res => {
      if (!res.ok) {
        let errMsg;
        try {
          const errBody = await res.json();
          if (!errBody.error) throw new Error();
          errMsg = errBody.error;
        } catch(err) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        throw new Error(errMsg);
      }
      return res.json();
    })
    .then(res => res as R)
    .catch((err) => {
      console.error(`API error calling ${method} ${path}`, err);
      throw err;
    });
  }
}

export default new API(`${env.BACKEND_URL}/api`);
