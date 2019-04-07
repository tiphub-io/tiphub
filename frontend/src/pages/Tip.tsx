import React from 'react';
import { Loader } from 'semantic-ui-react'
import { withRouter, RouteComponentProps } from 'react-router';
import api, { User, SelfUser } from '../api';
import TipForm from '../components/TipForm';

type Props = RouteComponentProps<{ userid: string }>;

interface State {
  user: User | SelfUser | undefined;
  error: string;
}

class Tip extends React.Component<Props, State> {
  state: State = {
    user: undefined,
    error: '',
  };

  async componentDidMount() {
    const { userid } = this.props.match.params;
    try {
      const user = await api.getUser(parseInt(userid, 10));
      this.setState({ user });
    } catch(err) {
      this.setState({ error: err.message });
    }
  }

  render() {
    const { user, error } = this.state;

    if (error) {
      return error;
    }

    let content;
    if (!user) {
      content = (
        <div className="Tip-loading">
          <Loader active size="large">Loading...</Loader>
        </div>
      );
    }
    else {
      content = <TipForm user={user} />
    }

    return (
      <div className="Tip">
        {content}
      </div>
    );
  }
};

export default withRouter(Tip);
