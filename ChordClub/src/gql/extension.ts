import gql from 'graphql-tag';
import { Extension } from '../types';

export const GET_EXTENSIONS = gql`
  query Extensions {
    extensions {
      id degree extensionType
    }
  }
`;

export interface GetExtensionsData {
  extensions: Extension[];
}
