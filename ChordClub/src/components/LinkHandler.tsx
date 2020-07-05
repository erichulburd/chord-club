import React from 'react';
import {Linking} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useContext, PropsWithChildren } from 'react';
import { useMutation, useApolloClient } from 'react-apollo';
import * as qs from 'querystring';
import { URL } from 'url';
import {
  ACCEPT_INVITATION, AcceptInvitationVariables,
  AcceptInvitationData,
} from '../gql/invitation';
import { AuthContext } from './UserContext';
import { Screens } from './AppScreen';
import { GET_TAGS } from '../gql/tag';
import { makeDefaultTagQuery } from './TagList';

export const LinkHandler = ({ children }: PropsWithChildren<{}>) => {
  const navigation = useNavigation();
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
    const parsedURL = new URL(url)
    const query = qs.parse(parsedURL.search.replace(/^\?/, ''));
    const token = query.inviteToken instanceof Array ? query.inviteToken[0] : query.inviteToken || '';
    if (token && authCtx.user) {
      // accept invitation
      acceptInvitation({
        variables: { token },
      });
    }
  }, [url]);

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
