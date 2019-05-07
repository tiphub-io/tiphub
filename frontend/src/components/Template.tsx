import React from 'react';
import { Link } from 'react-router-dom';
import TipHubLogo from '../images/logo.svg';
import './Template.less';


interface Props {
  children: React.ReactNode;
}

export default class Template extends React.Component<Props> {
  render() {
    const { children } = this.props;

    return (
      <div className="Template">
        <div className="Template-header">
          <div className="Template-header-inner">
            <Link to="/">
              <h1 className="Template-header-title">
                <img src={TipHubLogo} alt="TipHub" />
              </h1>
            </Link>
            <div className="Template-header-menu">
              <Link to="/about">About</Link>
              <Link to="/user/me">Account</Link>
            </div>
          </div>
        </div>
        <div className="Template-content">
          <div className="Template-content-inner">
            {children}
          </div>
        </div>
        <footer className="Template-footer">
          <div className="Template-footer-inner">
            <p>
              TipHub is fully open source on{' '}
              <a href="https://github.com/tiphub-io/tiphub" target="_blank">GitHub</a>
            </p>
            <p>
              Made with ❤️and ⚡️
            </p>
          </div>
        </footer>
      </div>
    );
  }
}