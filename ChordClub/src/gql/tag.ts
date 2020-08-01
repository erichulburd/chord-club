import gql from 'graphql-tag';
import {TagQuery, Tag} from '../types';

export const tagDBFields = gql`
  fragment TagDBFields on Tag {
    id
    displayName
    tagType
    munge
    createdBy
    creator { uid username }
  }
`;

export const GET_TAGS = gql`
  query GetTags($query: TagQuery!) {
    tags(query: $query) {
      ...TagDBFields
    }
  }
  ${tagDBFields}
`;

export interface GetTagsData {
  tags: Tag[];
}

export interface GetTagsVariables {
  query: TagQuery;
}

export const DELETE_TAG = gql`
  mutation DeleteTag($tagID: Int!) {
    deleteTag(tagID: $tagID) {
      empty
    }
  }
`;

export interface DeleteTagVariables {
  tagID: number;
}

export const DELETE_TAG_ACCESS_POLICY = gql`
  mutation DeleteTagAccessPolicy($tagID: Int!) {
    deleteTagAccessPolicy(tagID: $tagID) {
      empty
    }
  }
`;

export interface DeleteTagAccessPolicyVariables {
  tagID: number;
}
