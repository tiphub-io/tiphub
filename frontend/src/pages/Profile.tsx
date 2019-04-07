import React from 'react';
import { Tab, Loader } from 'semantic-ui-react'
import { withRouter, RouteComponentProps } from 'react-router';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTips from '../components/ProfileTips';
import EmbedForm from '../components/EmbedForm';
import NodeForm from '../components/NodeForm';
import api, { User, SelfUser } from '../api';
import './Profile.less';

function isSelfUser(user: User | SelfUser): user is SelfUser {
  return !!(user as SelfUser).date_created;
}

type Props = RouteComponentProps<{ userid: string }>;

interface State {
  user: User | SelfUser | undefined;
  error: string;
}

class Profile extends React.Component<Props, State> {
  state: State = {
    user: undefined,
    error: '',
  };

  componentDidMount() {
    const { userid } = this.props.match.params;
    let req;
    if (userid.toLowerCase() === 'me') {
      req = api.getSelf();
    } else {
      req = api.getUser(parseInt(userid, 10));
    }

    req.then(user => {
      this.setState({ user });
    }).catch(err => {
      this.setState({ error: err.message });
    });
  }

  render() {
    const { user, error } = this.state;

    if (error) {
      return error;
    }

    let content;
    if (!user) {
      content = (
        <div className="Profile-loading">
          <Loader active size="large">Loading...</Loader>
        </div>
      );
    }
    else if (isSelfUser(user)) {
      const panes = [{
        menuItem: 'Tips',
        render: () => <ProfileTips />,
      }, {
        menuItem: 'Embed',
        render: () => <EmbedForm user={user} />,
      }, {
        menuItem: 'Config',
        render: () => {
          const u = user as SelfUser;
          if (!u || !u.macaroon) {
            return null;
          }
          const form = {
            nodeUrl: u.node_url,
            macaroon: u.macaroon,
            cert: u.cert,
            email: u.email,
          };
          return (
            <NodeForm
              userid={u.id}
              initialFormState={form}
              onSubmit={() => alert('Saved!')}
            />
          );
        },
      }];
      content = <Tab menu={{ secondary: true, pointing: true }} panes={panes} />;
    } else {
      content = <h1>Look at me!</h1>;
    }

    return (
      <div className="Profile">
        <ProfileHeader user={user} />
        {content}
      </div>
    );
  }
};

export default withRouter(Profile);
