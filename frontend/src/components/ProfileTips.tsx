import React from 'react';
import moment from 'moment';
import { Placeholder, Feed, Pagination, Image, Segment, Header, Icon, PaginationProps } from 'semantic-ui-react';
import api, { User, Tip, PagesData } from '../api';
import './ProfileTips.less';

interface Props {
  user: User;
}

interface State {
  tips: Tip[];
  page: number;
  pageData: PagesData | null;
  isLoading: boolean;
}

export default class ProfileTips extends React.Component<Props, State> {
  state: State = {
    tips: [],
    page: 1,
    pageData: null,
    isLoading: false,
  };

  componentDidMount() {
    this.fetchTips(1);
  }

  render() {
    const { tips, page, pageData, isLoading } = this.state;
  
    let content;
    if (isLoading) {
      const placeholder = (
        <Placeholder>
          <Placeholder.Header image>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
        </Placeholder>
      );
      content = (
        <>
          {placeholder}
          {placeholder}
          {placeholder}
          {placeholder}
          {placeholder}
        </>
      );
    } else {
      content = tips.map(t => (
        <Feed.Event key={t.id}>
          <Feed.Label>
            <Image avatar src={this.getRandomImage(t.id)} />
          </Feed.Label>
          <Feed.Content>
            <Feed.Date>
              {moment(t.date_created).fromNow()}
            </Feed.Date>
            <Feed.Summary>
              <strong>{t.sender || <em>Anonymous tipper</em>}</strong>
              {' '}tipped you <strong>{t.amount} sats</strong>
            </Feed.Summary>
            {t.message && (
              <Feed.Extra text>"{t.message}"</Feed.Extra>
            )}
          </Feed.Content>
        </Feed.Event>
      ));

      if (!tips.length) {
        content = (
          <Segment placeholder textAlign="center">
            <Header icon>
              <Icon name="battery empty" /> No tips yet
            </Header>
          </Segment>
        );
      }
    }

    return (
      <div className="ProfileTips">
        <Feed className="ProfileTips-tips" size="large">{content}</Feed>
        {pageData && pageData.pages > 0 && (
          <Pagination
            activePage={page}
            totalPages={pageData.pages}
            onPageChange={this.handleChangePage}
          />
        )}
      </div>
    );
  }

  private handleChangePage = (_: any, data: PaginationProps) => {
    this.fetchTips(data.activePage as number);
  };

  private fetchTips = async (page: number) => {
    this.setState({ page, isLoading: true });
    try {
      const res = await api.getUserTips(this.props.user.id, page - 1);
      this.setState({
        tips: res.tips,
        pageData: res.pagination,
        isLoading: false,
      })
    } catch(err) {
      console.error(err);
      alert(err.message);
    }
    this.setState({ isLoading: false });
  };

  private getRandomImage = (id: number) => {
    const avatars = [
      'ade',
      'chris',
      'christian',
      'daniel',
      'elliot',
      'helen',
      'jenny',
      'joe',
      'justen',
      'laura',
      'matt',
      'nan',
      'nom',
      'steve',
      'stevie',
      'tom',
      'veronika',
      'zoe',
    ];
    const avatar = avatars[id % avatars.length]
    return `https://react.semantic-ui.com/images/avatar/small/${avatar}.jpg`;
  };
}