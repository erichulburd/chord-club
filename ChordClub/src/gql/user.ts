import gql from 'graphql-tag';
import { UserNew, User } from '../types';

export const GET_ME = gql`
  query Me {
    me {
      uid username createdAt
    }
  }
`;

export interface GetMeData {
  me: User;
}

export const CREATE_USER = gql`
  mutation CreateUser($newUser: UserNew!) {
    createUser(newUser: $newUser) {
      uid username createdAt
    }
  }
`;

export interface CreateUserVariables {
  newUser: UserNew;
}
