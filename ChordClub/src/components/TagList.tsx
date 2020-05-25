import React, {useContext, useState} from 'react';
import {
  TagQuery,
  BaseScopes,
  TagType,
  TagQueryOrder,
  Tag,
  ChartType,
} from '../types';
import {AuthContext} from './UserContext';
import {useQuery, useMutation} from 'react-apollo';
import {GET_TAGS, GetTagsData, GetTagsVariables, DeleteTagVariables, DELETE_TAG} from '../gql/tag';
import {CenteredSpinner} from './CenteredSpinner';
import ErrorText from './ErrorText';
import {ApolloError} from 'apollo-client';
import {List, ListItem, Button} from '@ui-kitten/components';
import {View, ViewProps, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Screens} from './AppScreen';
import {ThemedIcon} from './FontAwesomeIcons';
import { ModalContext } from './ModalProvider';

const makeTagQuery = (scopes: string[]): TagQuery => ({
  scopes,
  tagTypes: [TagType.Descriptor, TagType.List],
  order: TagQueryOrder.DisplayName,
  asc: true,
});

interface Props {}

export const TagList = ({}: Props) => {
  const userCtx = useContext(AuthContext);
  const modalCtx = useContext(ModalContext);
  const uid = userCtx.user?.uid;
  const scopes = uid ? [uid, BaseScopes.Public] : [BaseScopes.Public];
  const [deleted, setDeleted] = useState<{[key: number]: boolean}>({});
  const [deleteMutation, _] = useMutation<{}, DeleteTagVariables>(DELETE_TAG);
  const onDelete = (tag: Tag) => {
    modalCtx.message({
      msg: 'This will delete this untag all chords and progressions and delete the tag. Confirm your intent.',
      status: 'danger',
    }, {
      confirm: () => {
        deleteMutation({ variables: { tagID: tag.id }});
        setDeleted({...deleted, [tag.id]: true});
      },
    })
  }
  const query = makeTagQuery(scopes);
  const {data, loading, error} = useQuery<GetTagsData, GetTagsVariables>(
    GET_TAGS,
    {
      variables: {query},
    },
  );
  const {navigate} = useNavigation();
  if (!data) {
    if (loading) {
      return <CenteredSpinner />;
    }
    const e =
      error ||
      new ApolloError({
        errorMessage: 'We failed to load tags from server.',
      });
    return <ErrorText error={e} />;
  }
  const goToChordTag = (tag: Tag) => {
    userCtx.updateChartQuery('chords', {
      tagIDs: [tag.id],
      chartTypes: [ChartType.Chord],
      scopes: query.scopes,
    });
    navigate(Screens.Chords);
  };
  const goToProgressionTag = (tag: Tag) => {
    userCtx.updateChartQuery('progressions', {
      tagIDs: [tag.id],
      chartTypes: [ChartType.Progression],
      scopes: query.scopes,
    });
    navigate(Screens.Progressions);
  };
  const TagLinks = (t: Tag) => (_props: ViewProps = {}) => (
    <View style={styles.tagLinks}>
      <Button
        size="tiny"
        appearance="ghost"
        status="basic"
        onPress={() => goToChordTag(t)}>
        Chords
      </Button>
      <Button
        size="tiny"
        appearance="ghost"
        status="basic"
        onPress={() => goToProgressionTag(t)}>
        Progressions
      </Button>
      <Button
        size="tiny"
        appearance="ghost"
        status="danger"
        accessoryLeft={ThemedIcon('times')}
        onPress={() => onDelete(t)} />
    </View>
  );
  const renderItem = ({item}: {item: Tag; index: number}) => (
    <ListItem
      disabled
      accessoryLeft={ThemedIcon(item.scope === uid ? 'user-lock' : 'users')}
      title={item.displayName}
      accessoryRight={TagLinks(item)}
    />
  );
  const tags = data.tags.filter(t => !deleted[t.id]);
  return (
    <View>
      <List data={tags} renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  tagLinks: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
