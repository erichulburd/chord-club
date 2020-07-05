import React, {useContext, useState} from 'react';
import {
  TagQuery,
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
import { ModalShareTag } from './ModalShareTag';

export const makeDefaultTagQuery = (): TagQuery => ({
  tagTypes: [TagType.Descriptor, TagType.List],
  order: TagQueryOrder.DisplayName,
  asc: true,
});

interface Props {}

export const TagList = ({}: Props) => {
  const userCtx = useContext(AuthContext);
  const modalCtx = useContext(ModalContext);
  const [deleted, setDeleted] = useState<{[key: number]: boolean}>({});
  const [deleteMutation, _] = useMutation<{}, DeleteTagVariables>(DELETE_TAG);
  const [sharingTagID, setSharingTagID] = useState<number | undefined>(undefined);
  const onDelete = (tag: Tag) => {
    modalCtx.message({
      msg: 'This untag all chords and progressions and delete the tag. Confirm your intent.',
      status: 'danger',
    }, {
      confirm: () => {
        deleteMutation({ variables: { tagID: tag.id }});
        setDeleted({...deleted, [tag.id]: true});
      },
      cancel: () => {},
    })
  }
  const query = makeDefaultTagQuery();
  const {data, loading, error, refetch} = useQuery<GetTagsData, GetTagsVariables>(
    GET_TAGS,
    {
      variables: {query},
    },
  );
  const maybeDoRefetch = () => {
    refetch && refetch().catch(err => console.warn(err));
  };
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
  const goToProgressionTag = (tag: Tag) => {
    userCtx.updateChartQuery('progressions', {
      tagIDs: [tag.id],
      chartTypes: [ChartType.Progression],
    });
    navigate(Screens.Progressions);
  };
  const TagLinks = (t: Tag, share: () => void) => (_props: ViewProps = {}) => (
    <View style={styles.tagLinks}>
      <Button
        size="tiny"
        appearance="ghost"
        status="success"
        accessoryLeft={ThemedIcon('list')}
        onPress={() => goToProgressionTag(t)} />
      <Button
        size="tiny"
        appearance="ghost"
        status="success"
        accessoryLeft={ThemedIcon('share')}
        onPress={share} />
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
      title={item.displayName}
      accessoryRight={TagLinks(item, () => setSharingTagID(item.id))}
    />
  );
  const tags = data.tags.filter(t => !deleted[t.id]);
  return (
    <View>
      <List
        refreshing={loading}
        onRefresh={maybeDoRefetch}
        data={tags}
        renderItem={renderItem}
      />
      {sharingTagID &&
        <ModalShareTag
          tagID={sharingTagID}
          visible={sharingTagID !== undefined}
          close={() => setSharingTagID(undefined)}
        />
      }
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
