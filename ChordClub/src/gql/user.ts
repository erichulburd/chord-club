import gql from 'graphql-tag';
import {UserNew, User, UserUpdate} from '../types';

const userDBFields = gql`
  fragment UserDBFields on User {
    uid
    username
    settings
  }
`;

export const GET_ME = gql`
  query Me {
    me {
      ...UserDBFields
    }
  }
  ${userDBFields}
`;

export interface GetMeData {
  me: User;
}

export const CREATE_USER = gql`
  mutation CreateUser($newUser: UserNew!) {
    createUser(newUser: $newUser) {
      ...UserDBFields
    }
  }
  ${userDBFields}
`;

export interface CreateUserVariables {
  newUser: UserNew;
}

export const UPDATE_USER = gql`
  mutation UpdateUser($userUpdate: UserUpdate!) {
    updateUser(userUpdate: $userUpdate) {
      ...UserDBFields
    }
  }
  ${userDBFields}
`;

export interface UpdateUserVariables {
  userUpdate: UserUpdate;
}

export interface UpdateUserResponse {
  updateUser: User;
}

export const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser {
      empty
    }
  }
`;
