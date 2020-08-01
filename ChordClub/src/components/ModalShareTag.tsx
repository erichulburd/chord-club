import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {StyleSheet, View, Clipboard} from 'react-native';
import {Modal, Text, Input, Button, Card} from '@ui-kitten/components';
import { useMutation } from 'react-apollo';
import { CreateInvitationData, CreateInvitationVariables, CREATE_INVITATION } from '../gql/invitation';
import { PolicyResourceType, PolicyAction } from '../types';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import config from '../util/config';

interface Props {
  tagID: number;
  visible: boolean;
  close: () => void;
}

const shareBaseURL = `${config.WEB_BASE_URL}/_/share`;

export const ModalShareTag = ({tagID, visible, close}: Props) => {
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const expiresInDaysOnChange = useCallback((text: string) => {
    let days = parseInt(text, 10);
    if (isNaN(days)){
      setExpiresInDays(undefined);
      return;
    }
    setExpiresInDays(days);
  }, []);
  const expiresAt = useMemo(() => {
    if (expiresInDays === undefined) {
      return undefined;
    }
    return moment().endOf('day').add(expiresInDays, 'days').format();
  }, [expiresInDays]);
  const [tokenExpirationHours, setTokenExpirationHours] = useState<number | undefined>(undefined);
  const tokenExpirationHoursOnChange = useCallback((text: string) => {
    let hrs = parseInt(text, 10);
    if (isNaN(hrs)){
      setTokenExpirationHours(undefined);
      return;
    }
    setTokenExpirationHours(hrs);
  }, []);
  const [isDetailed, setIsDetailed] = useState(false);
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={close}>
      <Card status="success">
        <View>
          <Text category="h4">Share your tag</Text>
          <Text category="p">Share your tag by generating a link and emailing it to friends.</Text>
          <Button
            appearance={'ghost'}
            onPress={isDetailed ? () => setIsDetailed(false) : () => setIsDetailed(true)}
          >{isDetailed ? 'Less' : 'More'}</Button>
        </View>
        {isDetailed &&
          <KeyboardAwareScrollView>
            <Text category="p">After creating an account they will have access to listen to all of your recordings with that tag. You are free to add and remove recordings to that tag whenever you feel like.</Text>
            <View style={styles.formRow}>
              <Text category="label">The link expires in (hours)</Text>
              <Input
                style={styles.numericInput}
                size={'small'}
                placeholder={'hours'}
                keyboardType={'numeric'}
                value={tokenExpirationHours?.toString()}
                onChangeText={tokenExpirationHoursOnChange}
              />
            </View>
            <View style={styles.formRow}>
              <Text category="label">Access expires in (days)</Text>
              <Input
                style={styles.numericInput}
                size={'small'}
                placeholder={'days'}
                keyboardType={'numeric'}
                value={expiresInDays?.toString()}
                onChangeText={expiresInDaysOnChange}
              />
            </View>
          </KeyboardAwareScrollView>
        }
        <View>
          <TagInvitationLink
            expiresAt={expiresAt}
            tokenExpirationHours={tokenExpirationHours}
            tagID={tagID}
            cancel={close}
          />
        </View>
      </Card>
    </Modal>
  );
};

interface TagInvitationLinkProps {
  tagID: number;
  expiresAt?: string | undefined;
  tokenExpirationHours?: number | undefined;
  cancel: () => void;
}

const TagInvitationLink = ({ cancel, tagID, expiresAt, tokenExpirationHours }: TagInvitationLinkProps) => {
  const [createInvitation, {data,loading}] = useMutation<CreateInvitationData, CreateInvitationVariables>(CREATE_INVITATION, {
    variables: {
      invitation: {
        resourceType: PolicyResourceType.Tag,
        resourceID: tagID,
        action: PolicyAction.Read,
        expiresAt,
      },
      tokenExpirationHours,
    },
  });
  const [token, setToken] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!token && data?.createInvitation?.token) {
      setToken(data.createInvitation.token);
    }
  }, [data?.createInvitation?.token]);
  useEffect(() => {
    if (token) {
      setToken(undefined);
    }
  }, [expiresAt, tokenExpirationHours]);
  const shareURL = useMemo(() => {
    if (!token) {
      return;
    }
    return `${shareBaseURL}?inviteToken=${token}`
  }, [token]);
  useEffect(() => {
    if (shareURL) {
      Clipboard.setString(shareURL);
    }
  }, [shareURL])
  const onPress = useCallback(() => {
    if (loading) {
      return;
    }
    if (shareURL) {
      Clipboard.setString(shareURL);
      return;
    }
    createInvitation();
  }, [shareURL, loading]);
  return (
    <View>
      {shareURL &&
        <Input
          value={shareURL}
          disabled
        />
      }
      <View style={styles.controls}>
        <Button
          appearance="outline"
          onPress={onPress}
        >
          {Boolean(token) ? 'Copy link' : 'Generate link'}
        </Button>
        <Button
          appearance="outline"
          status="warning"
          onPress={cancel}
        >Cancel</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  formRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numericInput: {
    width: 100,
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
});
