import gql from 'graphql-tag';
import { PolicyQuery, Policy, Invitation, InvitationQuery } from 'src/types';


export const GET_TAG_POLICIES_AND_INVITATIONS = gql`
query GetTagPoliciesAndInvitations($policyQuery: PolicyQuery!, $invitationQuery: InvitationQuery!) {
  invitations(query: $invitationQuery) {
    id createdAt expiresAt
  }
  policies(query: $policyQuery) {
    id createdAt expiresAt user { username }
  }
}
`;

export interface GetTagPoliciesAndInvitationsVariables {
  policyQuery: PolicyQuery;
  invitationQuery: InvitationQuery;
}

export interface GetTagPoliciesAndInvitationsData {
  invitations: Invitation[];
  policies: Policy[];
}


export const DELETE_POLICY = gql`
  mutation DeletePolicy($policyID: Int!) {
    deletePolicy(policyID: $policyID) {
      empty
    }
  }
`;

export interface DeletePolicyVariables {
  policyID: number;
}
