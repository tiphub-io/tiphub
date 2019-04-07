import React from 'react';
import { Search, SearchProps, SearchResultData } from 'semantic-ui-react';
import api, { User } from '../api';
import { CONNECTION_UI } from '../util/constants';
import { withRouter, RouteComponentProps } from 'react-router';

interface State {
  value: string;
  results: Object[];
  isLoading: boolean;
}

class UserSearch extends React.Component<RouteComponentProps, State> {
  state: State = {
    value: '',
    results: [],
    isLoading: false,
  };

  render() {
    return (
      <Search
        {...this.state}
        onSearchChange={this.handleSearch}
        onResultSelect={this.goToTip}
        showNoResults={!this.state.isLoading}
        size="large"
        fluid  
      />
    );
  }

  private handleSearch = (_: any, data: SearchProps) => {
    const value = data.value || '';
    this.setState({ value, isLoading: true });

    if (!value) {
      this.setState({ results: [], isLoading: false });
      return;
    }

    api.searchUsers(value).then(connections => {
      if (this.state.value !== value) return;
      const results = connections.map(c => ({
        // Display
        key: `${c.site} ${c.site_username}`,
        title: c.site_username,
        description: CONNECTION_UI[c.site].name,
        image: CONNECTION_UI[c.site].img(c),
        // Data for handler
        userid: c.user.id,
        site: c.site,
      }));
      this.setState({ results, isLoading: false });
    }).catch(err => {
      console.error(err);
      this.setState({ results: [], isLoading: false });
    });
  };

  private goToTip = (_: any, data: SearchResultData) => {
    this.props.history.push(`/user/${data.result.userid}/tip?site=${data.result.site}`);
  };
}

export default withRouter(UserSearch);
