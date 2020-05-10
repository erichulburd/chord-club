import React, {useState} from 'react';
import {useQuery} from 'react-apollo';
import {GetTagsData, GetTagsVariables, GET_TAGS} from '../gql/tag';
import {Spinner, Text} from '@ui-kitten/components';
import ErrorText from './ErrorText';
import {TagCollection} from './TagCollection';
import {TagType, Tag, BaseScopes} from '../types';
import TagAutocomplete from './TagAutocomplete';
import {areTagsEqual} from '../util/forms';

const allTagTypes = [TagType.Descriptor, TagType.List];

interface TagCollectionEditorProps {
  allowNewTags: boolean;
  scopes: string[];
  initialTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export const TagCollectionEditor = ({
  initialTags,
  onChange,
  scopes,
  allowNewTags,
}: TagCollectionEditorProps) => {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const addTag = (tag: Tag) => {
    if (tags.some((t) => areTagsEqual(t, tag))) {
      return;
    }
    const tagUpdate = [...tags, tag];
    setTags(tagUpdate);
    onChange(tagUpdate);
  };
  const removeTag = (tag: Tag) => {
    const index = tags.findIndex((t) => t.id === tag.id);
    if (index === -1) {
      return;
    }
    const tagUpdate = [...tags];
    tagUpdate.splice(index, 1);
    setTags(tagUpdate);
    onChange(tagUpdate);
  };
  return (
    <>
      <TagAutocomplete
        includePublic={scopes.includes(BaseScopes.Public)}
        allowNewTags={allowNewTags}
        placeholder={'Select tags'}
        onSelect={addTag}
      />
      <TagCollection tags={tags} onDelete={removeTag} />
    </>
  );
};

interface TagIDCollectionEditorProps
  extends Omit<TagCollectionEditorProps, 'initialTags'> {
  ids: number[];
  tagTypes?: TagType[];
}

export const TagIDCollectionEditor = ({
  ids,
  scopes,
  tagTypes = allTagTypes,
  ...rest
}: TagIDCollectionEditorProps) => {
  const {data, loading, error} = useQuery<GetTagsData, GetTagsVariables>(
    GET_TAGS,
    {
      variables: {
        query: {ids, scopes, tagTypes},
      },
    },
  );
  if (!data) {
    if (loading) {
      return <Spinner />;
    }
    if (error) {
      return <ErrorText error={error} />;
    }
    return <ErrorText error={'An error occurred retrieving tags.'} />;
  }
  return (
    <TagCollectionEditor {...rest} initialTags={data.tags} scopes={scopes} />
  );
};
