import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import NodeForm from '../components/NodeForm';
import api, { User } from '../api';

type Props = RouteComponentProps<{ userid: string }>;

interface State {
  user: User | null;
}

class ProfileSetup extends React.Component<Props, State> {
  state: State = {
    user: null,
  };

  async componentDidMount() {
    try {
      const user = await api.getSelf();
      this.setState({ user });
    } catch(err) {
      alert(err);
    }
  }

  render() {
    const { history } = this.props;
    const { user } = this.state;
    return (
      <NodeForm
        userid={user ? user.id : 0}
        onSubmit={() => history.replace('/user/me')}
      />
    );
  }
};

export default withRouter(ProfileSetup);
