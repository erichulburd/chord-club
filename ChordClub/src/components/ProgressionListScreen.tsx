import React from 'react';
import ProgressionList from './ProgressionList';
import { ChartType, BaseScopes } from '../types';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import { ChartQueryView } from './ChartQueryView';
import { Screens } from './AppScreen';

interface Props extends AuthConsumerProps {
}

const makeProgressionListQuery = (uid: string) => ({
  chartTypes: [ChartType.Progression],
  scopes: uid ? [BaseScopes.Public, uid] : [BaseScopes.Public],
});

export const ProgressionListScreen = ({ authState }: Props) => {
  return (
    <ChartQueryView
      title={Screens.Progressions}
      initialQuery={makeProgressionListQuery(authState.uid)}
      renderQueryResults={({ query }) => (
        <ProgressionList
          query={query}
          editChart={(chart) => undefined /* TODO */}
        />
      )}
    />
  );
};

export default withAuth(ProgressionListScreen);
