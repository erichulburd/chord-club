import React from 'react';
import {Linking} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useContext, PropsWithChildren } from 'react';
import { useMutation } from 'react-apollo';
import {
  ACCEPT_INVITATION, AcceptInvitationVariables,
  AcceptInvitationData,
} from '../gql/invitation';
import qs from 'qs';
import { AuthContext } from './UserContext';
import { Screens } from './AppScreen';
import { GET_TAGS } from '../gql/tag';
import { makeDefaultTagQuery } from './TagList';
import { ModalContext } from './ModalProvider';

export const LinkHandler = ({ children }: PropsWithChildren<{}>) => {
  const navigation = useNavigation();
  const modalCtx = useContext(ModalContext);
  const authCtx = useContext(AuthContext);
  const [acceptInvitation, acceptInvitationRes] = useMutation<AcceptInvitationData, AcceptInvitationVariables>(ACCEPT_INVITATION, {
    refetchQueries: [{
      query: GET_TAGS,
      variables: {
        query: makeDefaultTagQuery(),
      }
    }]
  });
  const [url, setURL] = useState<string | null>(null);
  useEffect(() => {
    async function initializeURLCallbacks() {
      const initialURL = await Linking.getInitialURL();
      setURL(initialURL);
      Linking.addEventListener('url', (e) => {
        setURL(e.url);
      });
    };
    initializeURLCallbacks();
    return () => Linking.removeAllListeners('url');
  }, [true]);

  useEffect(() => {
    if (!url) {
      return;
    }
    // Whenever a new URL is detected, parse it for an invitation token.
    const parts = url.split('?');
    if (parts.length < 2) {
      return;
    }
    const queryString = parts.slice(1).join('?');
    const query = qs.parse(queryString);
    const token = query.inviteToken instanceof Array ?
      query.inviteToken[0] :
      query.inviteToken || '';
    if (token && authCtx.user) {
      // accept invitation
      acceptInvitation({
        variables: { token: token.toString() },
      });
    }
  }, [url]);

  useEffect(() => {
    if (!acceptInvitationRes.error) {
      return
    }
    modalCtx.message({
      msg: 'The sharing token provided is invalid or expired. Please request another from the inviting user.',
      status: 'warning',
    })
  }, [acceptInvitationRes.error])

  const acceptedTag = acceptInvitationRes.data?.acceptInvitation;
  useEffect(() => {
    // Once a tag has been accepted, update the chart query
    // and navigate to the progressions list.
    if (!acceptedTag || !authCtx.user) {
      return;
    }
    authCtx.updateChartQuery('progressions', {
      ...(authCtx.user.settings.progressions.query),
      tagIDs: [acceptedTag.id],
    })
    navigation.navigate(Screens.Progressions);
  }, [acceptedTag?.id]);

  return <>{children}</>;
};
