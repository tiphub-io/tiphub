import React from 'react';
import { Form, Dropdown, Icon } from 'semantic-ui-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import SyntaxHighlighter from 'react-syntax-highlighter';
import syntaxStyle from 'react-syntax-highlighter/dist/styles/hljs/xcode';
import { User, Connection } from '../api';
import env from '../util/env';
import { CONNECTION_UI } from '../util/constants';
import DarkButton from '../images/tip-button-dark.png';
import LightButton from '../images/tip-button-light.png';
import OrangeButton from '../images/tip-button-orange.png';
import BlueButton from '../images/tip-button-blue.png';
import './EmbedForm.less';

const COLORS = [{
  name: 'Light',
  img: LightButton,
}, {
  name: 'Dark',
  img: DarkButton,
}, {
  name: 'Orange',
  img: OrangeButton,
}, {
  name: 'Blue',
  img: BlueButton,
}];

interface Props {
  user: User;
}

interface State {
  color: typeof COLORS[0];
  connection: Connection;
}

const makeCode = (id: number, name: string, pubkey: string, img: string, site: string) =>
`<p align="center">
  <a target="_blank" rel="noopener noreferrer" href="${window.location.origin}/user/${id}/tip?site=${site}">
    <img src="${window.location.origin}${img}" alt="Tip ${name} on TipHub" height="60">
    <br />
    My pubkey starts with <code>${pubkey.slice(0, 8)}</code>
  </a>
</p>`;

export default class EmbedForm extends React.Component<Props, State> {
  state: State = {
    color: COLORS[0],
    connection: this.props.user.connections[0],
  };
  
  render() {
    const { user } = this.props;
    const { color, connection } = this.state;
    const code = makeCode(user.id, connection.site_username, user.pubkey, color.img, connection.site);
    return (
      <div className="EmbedForm">
        <Form className="EmbedForm-form" size="large">
          <Form.Field>
            <label>Site</label>
            <Dropdown
              selection
              value={connection.site}
              options={user.connections.map(c => ({
                text: CONNECTION_UI[c.site].name,
                value: c.site,
              }))}
              onChange={this.handleChangeSite}
            />
          </Form.Field>
          <Form.Field>
            <label>Color</label>
            <Dropdown
              selection
              value={color.name}
              options={COLORS.map(color => ({
                text: color.name,
                value: color.name,
              }))}
              onChange={this.handleChangeColor}
            />
          </Form.Field>
          <CopyToClipboard text={code}>
            <Form.Button primary size="large" onClick={ev => ev.preventDefault()}>
              <Icon name="copy" /> Copy
            </Form.Button>
          </CopyToClipboard>
        </Form>
        <div className="EmbedForm-embed">
          <div className="EmbedForm-embed-code">
            <SyntaxHighlighter language="html" children={code} style={syntaxStyle} />
          </div>
          <div className="EmbedForm-embed-preview">
            <div dangerouslySetInnerHTML={{ __html: code }} />
          </div>
        </div>
      </div>
    )
  }

  private handleChangeColor = (_: any, data: any) => {
    const color = COLORS.find(c => c.name === data.value) as typeof COLORS[0];
    this.setState({ color });
  };

  private handleChangeSite = (_: any, data: any) => {
    console.log(data);
    const connection = this.props.user.connections.find(c => c.site === data.value) as Connection;
    this.setState({ connection });
  };
}