import gql from 'graphql-tag';
import { CreateInvitationResponse, NewInvitation, Tag } from '../types';

export const CREATE_INVITATION = gql`
  mutation CreateInvitation($invitation: NewInvitation!, $tokenExpirationHours: Int) {
    createInvitation(invitation: $invitation, tokenExpirationHours: $tokenExpirationHours) {
      token
    }
  }
`;

export interface CreateInvitationVariables {
  invitation: NewInvitation;
  tokenExpirationHours?: number;
}

export interface CreateInvitationData {
  createInvitation: CreateInvitationResponse;
}

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token) {
      id displayName creator { username }
    }
  }
`;

export interface AcceptInvitationVariables {
  token: string;
}

export interface AcceptInvitationData {
  acceptInvitation: Tag;
}
