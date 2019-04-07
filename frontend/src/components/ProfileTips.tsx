import React from 'react';
import { Grid, Placeholder, Segment } from 'semantic-ui-react';

export default class ProfileTips extends React.Component {
  render() {
    const placeholder = (
      <Placeholder>
        <Placeholder.Header image>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Header>
        <Placeholder.Paragraph>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Paragraph>
      </Placeholder>
    );

    return (
      <div className="ProfileTips" style={{ padding: '20px 0' }}>
        {placeholder}
        {placeholder}
        {placeholder}
      </div>
    );
  }
}