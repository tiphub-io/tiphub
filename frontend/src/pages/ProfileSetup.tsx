import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import NodeForm from '../components/NodeForm';

type Props = RouteComponentProps<{ userid: string }>;

const ProfileSetup: React.SFC<Props> = ({ match, history }) => {
  const userid = parseInt(match.params.userid, 10);
  return (
    <NodeForm
      userid={userid}
      onSubmit={() => history.replace(`/user/${userid}`)}
    />
  );
};

export default withRouter(ProfileSetup);
