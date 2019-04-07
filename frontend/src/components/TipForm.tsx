import React from 'react';
import { Form, Segment, Button, TextArea, Divider } from 'semantic-ui-react';
import QRCode from 'qrcode.react';
import api, { Tip, User } from '../api';
import { CONNECTION_UI } from '../util/constants';
import './TipForm.less';


interface Props {
  user: User;
}

interface State {
  sender: string;
  message: string;
  tip: Tip | null;
  error: string;
  isSubmitting: boolean;
}

export default class TipForm extends React.Component<Props, State> {
  state: State = {
    sender: '',
    message: '',
    tip: null,
    error: '',
    isSubmitting: false,
  };

  componentDidMount() {
    this.pollTip();
  }

  render() {
    const { user } = this.props;
    const { sender, message, tip, error, isSubmitting } = this.state;
    const connection = user.connections[0];

    let content;
    if (tip) {
      const url = `lightning:${tip.payment_request}`;
      content = (
        <div className="TipForm-invoice">
          <a className="TipForm-invoice-qr" href={url}>
            <QRCode value={tip.payment_request.toUpperCase()} size={320} />
          </a>
          <Form className="TipForm-invoice-pr" size="large">
            <TextArea value={tip.payment_request} rows={4} disabled />
          </Form>
          <Button href={url} size="huge" target="_blank" fluid secondary>
            ⚡ Open in Wallet
          </Button>
        </div>
      );
    } else {
      content = (
        <>
          <Form className="TipForm-form" size="large" onSubmit={this.handleSubmit}>
            <Form.Field
              label="Your name"
              control="input"
              name="sender"
              value={sender}
              onChange={this.handleChange}
              placeholder="Satoshi Nakamoto"
            />
            <Form.Field
              label="Message"
              control={TextArea}
              name="message"
              value={message}
              onChange={this.handleChange}
              placeholder="Optional. Say something nice!"
            />
            <Form.Button primary fluid size="large">
              Start tipping
            </Form.Button>
          </Form>
          <Divider horizontal section>or</Divider>
          <Button secondary onClick={this.submitAnonymously} size="large" fluid>
            Tip anonymously
          </Button>
        </>
      );
    }

    return (
      <div className="TipForm">
        <div className="TipForm-header">
          <img
            className="TipForm-header-image"
            src={CONNECTION_UI[connection.site].img(connection.site_username)}
          />
          You’re tipping {connection.site_username}
        </div>
        <Segment className="TipForm-card" size="massive" loading={isSubmitting}>
          {content}
        </Segment>
      </div>
    );
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [ev.target.name]: ev.target.value } as any);
  };

  private submitAnonymously = () => {
    this.setState({ sender: '', message: '', }, () => {
      this.handleSubmit();
    });
  };

  private handleSubmit = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault();
    const { sender, message } = this.state;
    this.setState({
      error: '',
      isSubmitting: true,
    })
    try {
      const tip = await api.makeTip(this.props.user.id, { sender, message });
      this.setState({ tip });
    } catch(err) {
      this.setState({ error: err.message });
    }
    this.setState({ isSubmitting: false });
  };

  private pollTip = () => {
    const { tip } = this.state;
    if (!tip) return;
  }
}