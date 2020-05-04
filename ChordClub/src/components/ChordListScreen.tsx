import React from 'react';
import ChordList from './ChordList';
import { ChartType, BaseScopes } from '../types';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import { ChartQueryView } from './ChartQueryView';
import { AppScreen, Screens } from './AppScreen';
import { Spinner } from '@ui-kitten/components';

interface Props extends AuthConsumerProps {
}

const makeChordListQuery = (uid: string) => ({
  chartTypes: [ChartType.Chord],
  scopes: uid ? [BaseScopes.Public, uid] : [BaseScopes.Public],
});

export const ChordListScreen = ({ authState }: Props) => {
  return (
    <AppScreen title={Screens.Chords}>
        {!Boolean(authState.token) && <Spinner />}
        {Boolean(authState.token) &&
          <ChartQueryView
            initialQuery={makeChordListQuery(authState.uid)}
            renderQueryResults={({ query }) => (
              <ChordList
                query={query}
                editChart={(chart) => undefined /* TODO */}
              />
            )}
          />
        }
    </AppScreen>
  );
};

export default withAuth(ChordListScreen);
