import React from 'react';
import { Button, Header, Divider, Search, Icon } from 'semantic-ui-react';
import { redirectToSignIn } from 'blockstack.js';
import { Link } from 'react-router-dom';
import { makeBackendUrl } from '../util/formatters';
import UserSearch from '../components/UserSearch';
import BlockstackIcon from '../images/blockstack.svg';
import './Home.less';

function blockstackConnect() {
  redirectToSignIn(`${window.location.origin}/auth/blockstack`);
}

const Home: React.SFC<{}> = () => (
  <div className="Home">
    <div className="Home-info">
      <h1 className="Home-info-title">
        Show open source some love
      </h1>
      <p className="Home-info-text">
        Set up or contribute to lightning tips for open source projects.
        Non-custodial, direct to the creators.
      </p>
      <Link to="/about">
        <Button size="huge" secondary>Learn more</Button>
      </Link>
    </div>
    <div className="Home-forms">
      <div className="Home-forms-start">
        <Header as="h2">
          Set up your node now
        </Header>
        <Button
          href={makeBackendUrl("/oauth/github/login")}
          size="big"
          color="black"
          fluid
        >
          <Icon name="github" /> Connect with GitHub
        </Button>
        <Button
          href={makeBackendUrl('/oauth/gitlab/login')}
          size="big"
          color="orange"
          fluid
        >
          <Icon name="gitlab" /> Connect with GitLab
        </Button>
        <Button
          onClick={blockstackConnect}
          size="big"
          color="purple"
          fluid
        >
          <img src={BlockstackIcon} className="Home-forms-start-icon" />{' '}Connect with Blockstack        
        </Button>
      </div>
      <Divider section horizontal>or</Divider>
      <div className="Home-forms-search">
        <Header as="h2">
          Find someone to tip
        </Header>
        <UserSearch />
      </div>
    </div>
  </div>
);

export default Home;
