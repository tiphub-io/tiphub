import { stringify } from 'query-string';
import { UserData } from 'blockstack.js/lib/auth/authApp';
import env from './util/env';

export enum ConnectionSite {
  github = 'github',
  gitlab = 'gitlab',
  blockstack = 'blockstack',
}

export interface Connection {
  site: ConnectionSite;
  site_id: string;
  site_username: string;
  user: User;
}

export interface SelfConnection extends Connection {
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

export interface Tip {
  id: number;
  date_created: string;
  sender: string | null;
  message: string | null;
  repo: string;
  amount: string;
  payment_request: string;
}

export interface PagesData {
  page: number;
  pages: number;
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

  getUserTips(id: number, page?: number) {
    return this.request<{
      user: User;
      tips: Tip[];
      pagination: PagesData;
    }>('GET', `/users/${id}/tips`, { page });
  }

  updateUser(id: number, args: Partial<SelfUser>) {
    return this.request<SelfUser>('PUT', `/users/${id}`, args);
  }

  searchUsers(query: string) {
    return this.request<Connection[]>('GET', `/users/search/${query}`);
  }

  getTip(id: number) {
    return this.request<Tip>('GET', `/tips/${id}`);
  }

  makeTip(id: number, args: Partial<Tip>) {
    return this.request<Tip>('POST', `/users/${id}/tip`, args);
  }

  blockstackAuth(data: UserData) {
    return this.request<SelfUser>('POST', '/auth/blockstack', {
      id: data.identityAddress,
      username: data.username,
    });
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
