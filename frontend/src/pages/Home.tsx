import React from 'react';
import { Button, Header } from 'semantic-ui-react';

const Home: React.SFC<{}> = () => (
  <>
    <Header inverted as="h1">
      Show open source some love
    </Header>
    <p>
      Set up or conribute to lightning tips for open source projects.
      Non-custodial, direct to the creators.
    </p>
    <Button size="huge">Learn more</Button>
  </>
);

export default Home;