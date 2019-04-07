import React from 'react';
import { Form, Input, Message, Button, Grid } from 'semantic-ui-react';
import { blobToString } from '../util/formatters';
import api, { SelfUser } from '../api';
import './NodeForm.less';

interface FormState {
  nodeUrl: string;
  macaroon: string;
  cert: string;
  email: string;
}

const defaultHelpText = {
  title: 'Need help?',
  content: (
    <>
      <p>
        We need some connection information to handle payments for your
        node.
      </p>
      <p>
        If you're confused about any of the fields, just hit the help
        button beside it.
      </p>
      <p>
        There's no security risk to your node by providing us this
        information. We'll only be able to generate new invoices, we
        won't have access to your funds.
      </p>
    </>
  ),
};
const helpText = {
  nodeUrl: {
    title: 'gRPC Endpoint',
    content: (
      <>
        <p>
          The gRPC endpoint is the URL we'll use to communicate with your node.
          It is configured by <code>rpclisten</code> in <code>lnd.conf</code>.
        </p>
        <p>
          Every time someone wants to tip you, we'll make a request to it to
          generate a new invoice. This means your server must be online and
          accessible at all times.
        </p>
      </>
    ),
  },
  macaroon: {
    title: 'Invoice Macaroon',
    content: (
      <>
        <p>
          The invoice macaroon is a file that gives us authorized access
          to generate invoices on your node.
        </p>
        <p>
          Make sure you do not upload your <code>readonly.macaroon</code> or
          {' '}<code>invoice.macaroon</code> files accidentally.
        </p>
        <p>
          The macaroons are usually located:
        </p>
        <Message.List items={[
          { content: (
            <>
              <strong>macOS:</strong>{' '}
              <code>~/Library/Application Support/Lnd/data/chain/*</code>
            </>
            )},
          { content: (
            <>
              <strong>Linux:</strong>{' '}
              <code>~/.lnd/data/chain/*</code>
            </>
          )},
          { content: (
            <>
              <strong>Window:</strong>{' '}
              <code>%APPDATA%\Lnd\data\chain\*</code>
            </>
          )},
        ]} />
      </>
    ),
  },
  cert: {
    title: 'TLS Certificate',
    content: (
      <>
        <p>
          The TLS certificate ensures our server that we're talking to your
          node, and encrypts the communication.
        </p>
        <p>
          The certificate is usually located:
        </p>
        <Message.List items={[
          { content: (
            <>
              <strong>macOS:</strong>{' '}
              <code>~/Library/Application Support/Lnd</code>
            </>
          )},
          { content: (
            <>
              <strong>Linux:</strong>{' '}
              <code>~/.lnd</code>
            </>
          )},
          { content: (
            <>
              <strong>Window:</strong>{' '}
              <code>%APPDATA%\Lnd</code>
            </>
          )},
        ]} />
      </>
    ),
  },
};
type HelpKey = keyof typeof helpText;

interface Props {
  userid: number;
  initialFormState?: FormState;
  onSubmit(user: SelfUser): void;
}

interface State {
  form: FormState;
  uploaded: {
    macaroon: boolean;
    cert: boolean;
  };
  helpKey: HelpKey | null;
  error: string;
  isSubmitting: boolean;
}

export default class NodeForm extends React.Component<Props, State> {
  state: State = {
    form: {
      nodeUrl: '',
      macaroon: '',
      cert: '',
      email: '',
    },
    uploaded: {
      macaroon: false,
      cert: false,
    },
    helpKey: null,
    error: '',
    isSubmitting: false,
  };

  constructor(props: Props) {
    super(props);
    if (props.initialFormState) {
      this.state = {
        ...this.state,
        form: { ...props.initialFormState },
      };
    }
  }

  render() {
    const { form, uploaded, helpKey, error, isSubmitting } = this.state;
    const size = 'large';
    const help = helpText[helpKey as HelpKey] || defaultHelpText;
    return (
      <div className="NodeForm">
        <Form className="NodeForm-form" size={size} onSubmit={this.handleSubmit}>
          <Form.Field
            label={this.renderLabel('gRPC Endpoint', 'nodeUrl')}
            control="input"
            name="nodeUrl"
            value={form.nodeUrl}
            onChange={this.handleChange}
            placeholder="198.51.100.0:10009"
          />
          <div className="NodeForm-form-files">
            <Form.Field>
              {this.renderLabel('Invoice macaroon', 'macaroon')}
              <Input
                name="macaroon"
                value={form.macaroon}
                onChange={this.handleChange}
                placeholder="Hex encoded, or file"
                disabled={uploaded.macaroon}
                action={
                  <label htmlFor="node-form-macaroon">
                    <Button as="div" icon="upload" size={size}/>
                    <input
                      hidden
                      id="node-form-macaroon"
                      type="file"
                      onChange={this.handleMacaroon}
                    />
                  </label>
                }
              />
            </Form.Field>
            <Form.Field>
              {this.renderLabel('TLS Certificate', 'cert')}
              <Input
                name="cert"
                value={form.cert}
                onChange={this.handleChange}
                placeholder="Base64 encoded, or file"
                disabled={uploaded.cert}
                action={
                  <label htmlFor="node-form-cert">
                    <Button as="div" icon="upload" size={size}/>
                    <input
                      hidden
                      id="node-form-cert"
                      type="file"
                      onChange={this.handleCert}
                    />
                  </label>
                }
              />
            </Form.Field>
          </div>
          <Form.Field
            label="Email (optional)"
            control="input"
            name="email"
            value={form.email}
            onChange={this.handleChange}
            placeholder="satoshi@nakamoto.com"
          />
          {error && (
            <Message error header="Submission failed" content={error} />
          )}
          <Button size="large" fluid primary loading={isSubmitting}>
            Submit
          </Button>
        </Form>
        <div className="NodeForm-help">
          <Message info>
            <Message.Header>{help.title}</Message.Header>
            {help.content}
          </Message>
        </div>
      </div>
    );
  }

  private renderLabel = (label: string, helpKey: HelpKey) => {
    return (
      <label className="NodeForm-form-label">
        {label}
        <Button
          className="NodeForm-form-label-help"
          circular
          icon="help"
          onClick={() => this.setState({ helpKey })}
        />
      </label>
    );
  };

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const form: FormState = {
      ...this.state.form,
      [ev.target.name]: ev.target.value,
    };
    this.setState({ form });
  };

  private handleMacaroon = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.handleFileOrInput('macaroon', ev.target);
  };

  private handleCert = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.handleFileOrInput('cert', ev.target);
  };

  private handleFileOrInput = async (name: 'cert' | 'macaroon', target: HTMLInputElement) => {
    if (!target.files) return;
    const file = target.files[0];
    let form, uploaded;
    if (file) {
      const value = await blobToString(file, name === 'cert' ? 'base64' : 'hex');
      form = {
        ...this.state.form,
        [name]: value,
      };
      uploaded = {
        ...this.state.uploaded,
        [name]: true,
      };
    } else {
      form = {
        ...this.state.form,
        [name]: '',
      };
      uploaded = {
        ...this.state.uploaded,
        [name]: true,
      };
    }
    this.setState({
      form,
      uploaded,
    });
  };

  private handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    this.setState({
      error: '',
      isSubmitting: true,
    })
    try {
      const user = await api.updateUser(this.props.userid, this.state.form);
      this.props.onSubmit(user);
    } catch(err) {
      this.setState({ error: err.message });
    }
    this.setState({ isSubmitting: false });
  };
}