import React, {useContext, useState} from 'react';
import {
  Tag,
  ChartType,
  PolicyResourceType,
  PolicyResource,
  Policy,
} from '../types';
import {AuthContext} from './UserContext';
import {useLazyQuery, useMutation} from 'react-apollo';
import {Button, Text} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Screens} from './AppScreen';
import {ThemedIcon} from './FontAwesomeIcons';
import { GET_TAG_POLICIES_AND_INVITATIONS, GetTagPoliciesAndInvitationsData, GetTagPoliciesAndInvitationsVariables, DELETE_POLICY } from '../gql/policy';
import { CenteredSpinner } from './CenteredSpinner';
import ErrorText from './ErrorText';
import moment from 'moment';
import { DELETE_INVITATION } from '../gql/invitation';
import { ModalContext } from './ModalProvider';
import { CaretToggle } from './CaretToggle';

interface Props {
  tag: Tag;
  onDelete: (t: Tag) => void;
  share: (t: Tag) => void;
}

export const TagItem = ({
  tag, onDelete, share,
}: Props) => {
  const userCtx = useContext(AuthContext);
  const {navigate} = useNavigation();
  const [isDetailed, setIsDetailed] = useState(false);

  const resource: PolicyResource = {
    resourceType: PolicyResourceType.Tag,
    resourceID: tag.id,
  }
  const variables: GetTagPoliciesAndInvitationsVariables = {
    invitationQuery: { resource },
    policyQuery: { resource },
  }
  const [getTagAccess, getTagAccessRes] = useLazyQuery<GetTagPoliciesAndInvitationsData, GetTagPoliciesAndInvitationsVariables>(GET_TAG_POLICIES_AND_INVITATIONS, { variables });

  const toggleIsDetailed = () => {
    if (isDetailed) {
      setIsDetailed(false);
      return;
    }
    getTagAccess();
    setIsDetailed(true);
  }

  const goToProgressionTag = (tag: Tag) => {
    userCtx.updateChartQuery('progressions', {
      tagIDs: [tag.id],
      chartTypes: [ChartType.Progression],
    });
    navigate(Screens.Progressions);
  };

  const refetchQueries = [{
    query: GET_TAG_POLICIES_AND_INVITATIONS,
    variables,
  }]
  const [deletePolicy] = useMutation(DELETE_POLICY, {
    refetchQueries,
  });
  const modalCtx = useContext(ModalContext);
  const onDeletePolicy = (policy: Policy) => {
    modalCtx.message({
      msg: `This will remove ${policy.user?.username}'s access to progressions '${tag.displayName}'. Confirm your intent.`,
      status: 'danger',
    }, {
      confirm: () => {
        deletePolicy({ variables: {policyID: policy.id} });
      },
      cancel: () => {},
    })
  }
  const [deleteInvitation] = useMutation(DELETE_INVITATION, {refetchQueries});
  const onDeleteInvitation = (invitationID: number) => {
    modalCtx.message({
      msg: `Users will no longer be able to use this link to access tag '${tag.displayName}'. Confirm your intent.`,
      status: 'danger',
    }, {
      confirm: () => {
        deleteInvitation({ variables: {invitationID} });
      },
      cancel: () => {},
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <View>
          <Text category="s1" style={styles.displayName}>{tag.displayName}</Text>
          <Text style={styles.creator}>{tag.creator?.username}</Text>
        </View>
        <View style={styles.tagLinks}>
          <Button
            size="tiny"
            appearance="ghost"
            status="success"
            accessoryLeft={ThemedIcon('list')}
            onPress={() => goToProgressionTag(tag)} />
          <Button
            size="tiny"
            appearance="ghost"
            status={tag.createdBy === userCtx.getUID() ? "success" : "basic"}
            accessoryLeft={ThemedIcon('share')}
            onPress={tag.createdBy === userCtx.getUID() ? () => share(tag) : undefined} />
          <Button
            size="tiny"
            appearance="ghost"
            status="danger"
            accessoryLeft={ThemedIcon('times')}
            onPress={() => onDelete(tag)} />
          <CaretToggle
            disabled={tag.createdBy !== userCtx.getUID()}
            isOpen={isDetailed}
            toggle={toggleIsDetailed}
          />
        </View>
      </View>
      {(isDetailed && getTagAccessRes.loading) &&
        <CenteredSpinner />
      }
      {(isDetailed && getTagAccessRes.error) &&
        <ErrorText error={'We failed to retrieve tag access data.'} />
      }
      {(isDetailed && getTagAccessRes.data) &&
        <>
        {getTagAccessRes.data.policies.length > 0 &&
          <View style={styles.table}>
            <Text category="label">User access</Text>
            <View style={styles.tableRow}>
              <Text category="label" style={styles.tableCellUsername}>Username</Text>
              <Text category="label" style={styles.tableCell}>Access since</Text>
              <Text category="label" style={styles.tableCell}>Access expires</Text>
              <View style={styles.tableCell} />
            </View>
            {getTagAccessRes.data.policies.map((p) => (
              <View key={p.id} style={styles.tableRow}>
                <Text style={styles.tableCellUsername}>{p.user?.username}</Text>
                <Text style={styles.tableCell}>{(moment(p.createdAt).format('MMM D, YYYY'))}</Text>
                <Text style={styles.tableCell}>{(p.expiresAt || '') && (moment(p.expiresAt).format('MMM D, YYYY'))}</Text>
                <View style={styles.tableCell}>
                  <Button
                    appearance="ghost"
                    status="danger"
                    size="tiny"
                    onPress={() => onDeletePolicy(p)}
                    accessoryLeft={ThemedIcon('times')}
                  />
                </View>
              </View>
            ))}
          </View>
        }
        {getTagAccessRes.data.invitations.length > 0 &&
          <View style={styles.table}>
            <Text category="label">Sharing links</Text>
            <View style={styles.tableRow}>
              <Text category="label" style={styles.tableCell}>Created at</Text>
              <Text category="label" style={styles.tableCell}>Expires at</Text>
              <View style={styles.tableCell} />
            </View>
            {getTagAccessRes.data.invitations.map((invitation) => (
              <View key={invitation.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{(moment(invitation.createdAt).format('MMM D, YYYY'))}</Text>
                <Text style={styles.tableCell}>{(invitation.expiresAt || '') && moment(invitation.expiresAt).format('MMM D, YYYY')}</Text>
                <View style={styles.tableCell}>
                  <Button
                    appearance="ghost"
                    status="danger"
                    size="tiny"
                    onPress={() => onDeleteInvitation(invitation.id)}
                    accessoryLeft={ThemedIcon('times')}
                  />
                </View>
              </View>
            ))}
          </View>
        }
        </>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderBottomColor: 'white',
    borderBottomWidth: 2,
  },
  tagLinks: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  mainRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  table: {
    padding: 5,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    borderColor: 'white',
    borderWidth: 1,
    padding: 4,
  },
  tableCell: {
    flex: 1,
    flexWrap: 'wrap',
    padding: 3,
  },
  tableCellUsername: {
    flex: 4,
    flexWrap: 'wrap',
    padding: 3,
  },
  displayName: {
    marginBottom: 3,
  },
  creator: {
    fontStyle: 'italic'
  }
});
