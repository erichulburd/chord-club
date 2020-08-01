import React, {useState, useContext, useEffect} from 'react';
import {useQuery} from 'react-apollo';
import {GetTagsData, GetTagsVariables, GET_TAGS} from '../gql/tag';
import {Spinner} from '@ui-kitten/components';
import ErrorText from './ErrorText';
import {TagCollection} from './TagCollection';
import {TagType, Tag, TagNew} from '../types';
import TagAutocomplete from './TagAutocomplete';
import {areTagsEqual, getTagMunge} from '../util/forms';
import { makeDefaultTagQuery } from './TagList';
import { AuthContext } from './UserContext';

const allTagTypes = [TagType.Descriptor, TagType.List];

interface TagCollectionEditorProps {
  allowNewTags: boolean;
  initialTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export const TagCollectionEditor = ({
  initialTags,
  onChange,
  allowNewTags,
}: TagCollectionEditorProps) => {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);
  const userCtx = useContext(AuthContext);
  const addTag = (tag: Tag) => {
    if (tags.some((t) => areTagsEqual(t, tag, userCtx.getUID()))) {
      return;
    }
    const tagUpdate = [...tags, tag];
    setTags(tagUpdate);
    onChange(tagUpdate);
  };
  const removeTag = (tag: Tag | TagNew) => {
    const index = tags.findIndex((t) => areTagsEqual(t, tag, userCtx.getUID()));
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
  tagTypes = allTagTypes,
  ...rest
}: TagIDCollectionEditorProps) => {
  const {data, loading, error} = useQuery<GetTagsData, GetTagsVariables>(
    GET_TAGS,
    {
      variables: {
        query: makeDefaultTagQuery(),
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
  const includedTags = data.tags.filter(t => ids.some(id => id === t.id));
  return (
    <TagCollectionEditor {...rest} initialTags={includedTags} />
  );
};
