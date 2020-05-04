import React from 'react';
import ChartList from './ChartList';
import { ChartType, BaseScopes } from '../types';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import { ChartQueryView } from './ChartQueryView';
import { AppScreen, Screens } from './AppScreen';

interface Props extends AuthConsumerProps {
}

const makeChordListQuery = (uid: string) => ({
  chartTypes: [ChartType.Chord],
  scopes: [BaseScopes.Public, uid],
});

export const ChordListScreen = ({ authState }: Props) => {
  return (
    <AppScreen title={Screens.ChordList}>
        {Boolean(authState.token) &&
          <ChartQueryView
            initialQuery={makeChordListQuery(authState.uid)}
            renderQueryResults={({ query }) => (
              <ChartList
                query={query}
                editChart={(chart) => undefined}
              />
            )}
          />
        }
    </AppScreen>
  );
};

export default withAuth(ChordListScreen);
