import React, {createElement} from 'react';
import {
  Autocomplete,
  AutocompleteItem,
  IconProps,
  Spinner,
} from '@ui-kitten/components';
import {View, StyleProp, ViewStyle} from 'react-native';
import {GET_TAGS, GetTagsData, GetTagsVariables} from '../gql/tag';
import {TagQuery, TagType, TagNew, Tag} from '../types';
import {ThemedIcon} from './FontAwesomeIcons';
import throttle from 'lodash/throttle';
import {makeTagNew, getTagMunge, areTagsEqual} from '../util/forms';
import {withUser, UserConsumerProps} from './UserContext';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import ErrorText from './ErrorText';
import {ApolloError} from 'apollo-client';

import {WithApolloClient, withApollo} from 'react-apollo';
import {GraphQLError} from 'graphql';
import logger from '../util/logger';
import { has } from 'lodash';

interface ManualProps {
  placeholder?: string;
  onSelect: ((t: TagNew | Tag) => void) | ((t: Tag) => void);
  allowNewTags?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  createdBy?: string;
}

interface Props extends WithApolloClient<{}>, ManualProps, UserConsumerProps {}

interface State {
  query: TagQuery;
  displayName: string;
  error?: ApolloError;
  loading: boolean;
  options: any[];
  queryTs?: number;
}

const fauxResult = makeTagNew('No results');

export class TagAutocomplete extends React.Component<Props> {
  public state: State = {
    displayName: '',
    query: {
      tagTypes: [TagType.List],
    },
    loading: false,
    options: [],
  };
  private throttleQuery: () => Promise<void>;

  constructor(props: Props) {
    super(props);

    this.throttleQuery = throttle(() => this.execQuery(), 500);
    const {query} = this.state;
    if (props.createdBy) {
      this.setState({ query: {...query, createdBy: props.createdBy} });
    } else {
      this.setState({ query: {...query, createdBy: props.userCtx.getUID()} });
    }
  }

  private execQuery = async () => {
    const {query} = this.state;
    const {client} = this.props;
    const queryTs = Date.now();
    this.setState({loading: true, queryTs});
    try {
      const {data, errors} = await client.query<GetTagsData, GetTagsVariables>({
        query: GET_TAGS,
        variables: {query},
      });
      if (this.state.queryTs !== queryTs) {
        return;
      }
      this.updateOptions(data, errors);
    } catch (err) {
      logger.error(err);
      const error = new ApolloError({
        errorMessage:
          'We received an unexpeted error while connecting to our server.',
      });
      this.setState({error, loading: false, queryTs: undefined});
    }
  };

  private updateOptions = (
    data: GetTagsData,
    errors: readonly GraphQLError[] | undefined,
  ) => {
    const {query, displayName} = this.state;
    const {userCtx, allowNewTags = true} = this.props;
    const uid = userCtx.getUID();
    let error;
    if (errors && errors.length > 0) {
      error = new ApolloError({graphQLErrors: errors});
    }
    const filter = displayName?.toLowerCase().trim();
    let options: (Tag | TagNew)[] = data.tags.filter(t => t.displayName.toLowerCase().indexOf(filter || '') >= 0);
    if (allowNewTags && displayName) {
      const tagNew = makeTagNew(displayName);
      const tagExists = options.some(
        (t) => areTagsEqual(t, tagNew, userCtx.getUID()),
      );
      if (!tagExists) {
        options = [tagNew, ...options];
      }
    }
    this.setState({options, error, loading: false, queryTs: undefined});
  };

  private updateQueryDisplayName = (displayName: string) => {
    this.setState({displayName}, () => {
      this.throttleQuery();
    });
  };

  private clearText = () => {
    const {query} = this.state;
    this.setState({query: {...query, displayName: ''}, options: []});
  };

  private onSelect = (index: number) => {
    const {query, options, displayName} = this.state;
    const {onSelect, userCtx} = this.props;
    const tag = options[index];
    if (tag === undefined || areTagsEqual(tag, fauxResult,  userCtx.getUID())) {
      return;
    }
    onSelect(tag);
    this.setState({
      displayName: '',
      query: {...query},
      options: [],
    });
  };

  public render() {
    const {userCtx, placeholder = 'Add tag', containerStyle = {}} = this.props;
    const {query, error, options, loading, displayName} = this.state;

    const renderCloseIcon = (props: IconProps) =>
      loading ? (
        <Spinner />
      ) : (
        <TouchableWithoutFeedback onPress={this.clearText}>
          {createElement(ThemedIcon('times'), props)}
        </TouchableWithoutFeedback>
      );
    let data = options;
    if (data.length === 0) {
      // If no data, insert a faux tag, otherwise, Autocomplete will not set
      // its state to listVisible: true on focus.
      data = [fauxResult];
    }
    return (
      <View style={containerStyle}>
        {error && <ErrorText error={error} />}
        <Autocomplete
          autoCapitalize={'none'}
          placeholder={placeholder}
          value={displayName || ''}
          accessoryRight={renderCloseIcon}
          onChangeText={this.updateQueryDisplayName}
          onSelect={this.onSelect}>
          {data.map((tag) => (
            <AutocompleteItem
              key={getTagMunge(tag)}
              title={displayTagName(tag, userCtx.getUID())}
            />
          ))}
        </Autocomplete>
      </View>
    );
  }
}

const displayTagName = (tag: Tag | TagNew, uid: string) => {
  const isOwner = !has(tag, 'createdBy') || (tag as Tag).createdBy === uid;
  if (isOwner) {
    return tag.displayName;
  }
  return `${(tag as Tag).creator?.username}::${tag.displayName}`;
}

export default withApollo<ManualProps>(
  withUser<WithApolloClient<ManualProps>>(TagAutocomplete),
);
