import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import CarlImage from '../images/carl.jpg';
import WillImage from '../images/will.png';
import './About.less';

const About: React.SFC = () => (
  <div className="About">
    <div className="About-section">
      <div className="About-section-label">About TipHub</div>
      <div className="About-section-content">
        <p>
          TipHub is a non-custodial tipping service, powered by the Lightning
          Network. Users can provide the site with credentials to create invoices
          that let people tip directly to their Lightning node.
        </p>
        <p>
          Funds are never at risk, as TipHub only asks for enough access to
          create and monitor invoices on behalf of the receiver. 
        </p>
        <p>
          TipHub currently only supports LND nodes, as that's the only Lightning
          node implementation that has standardized auth credentials that allow
          partially permissioned access. While we look forward to supporting
          more node types, user safety and privacy is our top concern.
        </p>
      </div>
    </div>
    <div className="About-section">
      <div className="About-section-label">About Us</div>
      <div className="About-section-content">
        <p>
          TipHub was created at the 2019 Bolt-a-Thon hackathon by Will
          O'Beirne and Carl Dong. However, anyone is welcome to contribute
          at the <a href="https://github.com/tiphub-io/tiphub">project GitHub</a>!
        </p>
        <div className="About-section-content-people">
          <div className="AboutPerson">
            <img className="AboutPerson-image" src={WillImage} />
            <div className="AboutPerson-name">Will O'Beirne</div>
            <div className="AboutPerson-blurb">
              Will is an open source engineer focused on the Lightning
              Network. He's also the creator of Joule, a lightning extension.
            </div>
            <div className="AboutPerson-buttons">
              <Button color="twitter" href="https://twitter.com/wbobeirne">
                <Icon name="twitter" /> wbobeirne
              </Button>
              <Button color="black" href="https://github.com/wbobeirne">
                <Icon name="github" /> wbobeirne
              </Button>
            </div>
          </div>

          <div className="AboutPerson">
            <img className="AboutPerson-image" src={CarlImage} />
            <div className="AboutPerson-name">Carl Dong</div>
            <div className="AboutPerson-blurb">
              Carl is an engineer at Chaincode Labs, formerly Blockstream.
            </div>
            <div className="AboutPerson-buttons">
              <Button color="twitter" href="https://twitter.com/carl_dong" target="_blank">
                <Icon name="twitter" /> carl_dong
              </Button>
              <Button color="black" href="https://github.com/dongcarl" target="_blank">
                <Icon name="github" /> dongcarl
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
