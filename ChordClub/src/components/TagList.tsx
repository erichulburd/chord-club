import React, {useContext, useState} from 'react';
import {
  TagQuery,
  TagType,
  TagQueryOrder,
  Tag,
} from '../types';
import {AuthContext} from './UserContext';
import {useQuery, useMutation} from 'react-apollo';
import {GET_TAGS, GetTagsData, GetTagsVariables, DeleteTagVariables, DELETE_TAG, DELETE_TAG_ACCESS_POLICY, DeleteTagAccessPolicyVariables} from '../gql/tag';
import {CenteredSpinner} from './CenteredSpinner';
import ErrorText from './ErrorText';
import {ApolloError} from 'apollo-client';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {View, StyleSheet} from 'react-native';
import { ModalContext } from './ModalProvider';
import { ModalShareTag } from './ModalShareTag';
import { TagItem } from './TagItem';

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
  const [deleteMutation, _res1] = useMutation<{}, DeleteTagVariables>(DELETE_TAG);

  const [deleteTagAccessPolicy, _res2] = useMutation<{}, DeleteTagAccessPolicyVariables>(DELETE_TAG_ACCESS_POLICY);
  const [sharingTagID, setSharingTagID] = useState<number | undefined>(undefined);
  const confirmDelete = (tag: Tag) => {
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
  };
  const confirmDeleteTagAccessPolicy = (tag: Tag) => {
    modalCtx.message({
      msg: `This will remove your access to progressions tagged '${tag.displayName}' by user ${tag.creator?.username}. Confirm your intent.`,
      status: 'danger',
    }, {
      confirm: () => {
        deleteTagAccessPolicy({ variables: { tagID: tag.id }});
        setDeleted({...deleted, [tag.id]: true});
      },
      cancel: () => {},
    })
  };
  const onDelete = (tag: Tag) => {
    if (tag.createdBy === userCtx.getUID()) {
      confirmDelete(tag);
    } else {
      confirmDeleteTagAccessPolicy(tag);
    }
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

  const renderItem = ({item}: {item: Tag; index: number}) => (
    <TagItem
      tag={item}
      onDelete={onDelete}
      share={(t) => setSharingTagID(t.id)}
    />
  );
  const tags = data.tags.filter(t => !deleted[t.id]);
  console.log(query);
  console.log(data.tags.map(t => t.displayName))
  console.log(tags.map(t => t.displayName))

  return (
    <View>
      <FlatList
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
