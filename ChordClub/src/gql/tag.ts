import gql from 'graphql-tag';
import { TagQuery, Tag } from '../types';


export const tagDBFields = gql`
  fragment TagDBFields on Tag {
    id
    displayName
    tagType
    scope
    munge
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
