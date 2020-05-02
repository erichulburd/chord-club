import React, { createElement } from 'react';
import { Autocomplete, AutocompleteItem, CheckBox, IconProps, Spinner, Text } from '@ui-kitten/components';
import { View, StyleProp, ViewStyle } from 'react-native';
import { GET_TAGS, GetTagsData, GetTagsVariables } from '../gql/tag';
import { TagQuery, BaseScopes, TagType, TagNew, Tag } from '../types';
import { ThemedIcon } from './FontAwesomeIcons';
import throttle from 'lodash/throttle';
import { makeTagNew, getTagMunge } from '../util/forms';
import { withAuth, AuthConsumerProps } from './AuthProvider';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import ErrorText from './ErrorText';
import { ApolloError } from 'apollo-client';

import { WithApolloClient, withApollo } from 'react-apollo';
import { GraphQLError } from 'graphql';
import logger from '../util/logger';

interface ManualProps {
  placeholder?: string;
  includePublic?: boolean;
  onSelect: (t: TagNew | Tag) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

interface Props extends WithApolloClient<{}>, ManualProps, AuthConsumerProps {}

interface State {
  query: TagQuery;
  error?: ApolloError;
  loading: boolean;
  options: any[];
  queryTs?: number;
  includePublic: boolean
}

export class TagAutocomplete extends React.Component<Props> {
  public state: State = {
    query: {
      displayName: '',
      scopes: [],
      tagTypes: [TagType.List],
      limit: 5,
    },
    loading: false,
    options: [],
    includePublic: false,
  }
  private throttleQuery: () => Promise<void>;

  constructor(props: Props) {
    super(props);

    this.throttleQuery = throttle(() => this.execQuery(), 500);
  }

  private includePublic() {
    return this.props.includePublic === undefined ?
      this.state.includePublic :
      this.props.includePublic;
  }

  private execQuery = async () => {
    const { query } = this.state;
    const { client, authState } = this.props;
    const queryTs = Date.now();
    this.setState({ loading: true, queryTs });
    const scopes = [authState.uid];
    if (this.includePublic()) {
      scopes.push(BaseScopes.Public);
    }
    try {
      const { data, errors } = await client.query<GetTagsData, GetTagsVariables>({
        query: GET_TAGS,
        variables: { query: { ...query, scopes } },
      });
      if (this.state.queryTs !== queryTs) {
        return;
      }
      this.updateOptions(data, errors);

    } catch (err) {
      logger.error(err);
      const error = new ApolloError({
        errorMessage: 'We received an unexpeted error while connecting to our server.',
      });
      this.setState({ error, loading: false, queryTs: undefined });
    }
  }

  private updateOptions = (data: GetTagsData, errors: readonly GraphQLError[] | undefined) => {
    const { query } = this.state;
    const { authState } = this.props;
    const { uid } = authState
    let error = undefined;
    if (errors && errors.length > 0) {
      error = new ApolloError({ graphQLErrors: errors });
    }
    let options: any[] = data.tags;
    if (query.displayName && !options.some(t => t.munge !== getTagMunge(query.displayName || ''))) {
      const tagNew = makeTagNew(query.displayName, this.includePublic(), uid);
      options = [ tagNew, ...options ];
    }
    this.setState({ options, error, loading: false, queryTs: undefined });
  }

  private updateQueryDisplayName = (displayName: string) => {
    this.setState({ query: { ...this.state.query, displayName } }, () => {
      this.throttleQuery();
    });
  }

  private clearText = () => {
    const { query } = this.state;
    this.setState({ query: { ...query, displayName: '' }, options: [] });
  }

  private onSelect = (index: number) => {
    const { query, options } = this.state;
    const { onSelect } = this.props;
    onSelect(options[index]);
    this.setState({
      query: { ...query, displayName: '' },
      options: [],
    });
  }

  public render() {
    const { placeholder = 'Add tag', containerStyle = {}, authState } = this.props;
    const { query, error, options, includePublic, loading } = this.state;

    const renderCloseIcon = (props: IconProps) =>
      loading ? <Spinner /> : (
        <TouchableWithoutFeedback onPress={this.clearText}>
          {createElement(ThemedIcon('times'), props)}
        </TouchableWithoutFeedback>
      );
    let data = options;
    if (data.length === 0) {
      // If no data, insert a faux tag, otherwise, Autocomplete will not set
      // its state to listVisible: true on focus.
      data = [makeTagNew('', this.includePublic(), authState.uid)];
    }
    return (
      <View style={containerStyle}>
        {error && <ErrorText error={error} />}
        <Autocomplete
          autoCapitalize={'none'}
          placeholder={placeholder}
          value={query.displayName || ''}
          accessoryRight={renderCloseIcon}
          onChangeText={this.updateQueryDisplayName}
          onSelect={this.onSelect}
        >
          {data.map((tag) =>(
            <AutocompleteItem
              key={getTagMunge(tag)}
              title={tag.displayName}
              accessoryLeft={ThemedIcon(tag.scope === BaseScopes.Public ? 'users' : 'user')}
            />
          ))}
        </Autocomplete>
        {this.props.includePublic === undefined &&
          <CheckBox
            status="control"
            checked={includePublic}
            onChange={c => this.setState({ includePublic: c })}
          >Include public?</CheckBox>
        }
      </View>
    );
  }
}

export default withApollo<ManualProps>(withAuth<WithApolloClient<ManualProps>>(TagAutocomplete));