import React from 'react';
import ChordList from './ChordList';
import { ChartType, BaseScopes } from '../types';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import { ChartQueryView } from './ChartQueryView';
import { Screens } from './AppScreen';

interface Props extends AuthConsumerProps {
}

const makeChordListQuery = (uid: string) => ({
  chartTypes: [ChartType.Chord],
  scopes: uid ? [BaseScopes.Public, uid] : [BaseScopes.Public],
});

export const ChordListScreen = ({ authState }: Props) => {
  return (
    <ChartQueryView
      title={Screens.Chords}
      initialQuery={makeChordListQuery(authState.uid)}
      renderQueryResults={({ query }) => (
        <ChordList
          query={query}
          editChart={(chart) => undefined /* TODO */}
        />
      )}
    />
  );
};

export default withAuth(ChordListScreen);
