import React from 'react';
import ProgressionList from './ProgressionList';
import { ChartType, BaseScopes } from '../types';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import { ChartQueryView } from './ChartQueryView';
import { AppScreen, Screens } from './AppScreen';
import { Spinner } from '@ui-kitten/components';

interface Props extends AuthConsumerProps {
}

const makeProgressionListQuery = (uid: string) => ({
  chartTypes: [ChartType.Progression],
  scopes: uid ? [BaseScopes.Public, uid] : [BaseScopes.Public],
});

export const ProgressionListScreen = ({ authState }: Props) => {
  return (
    <AppScreen title={Screens.ProgressionList}>
        {!Boolean(authState.token) && <Spinner />}
        {Boolean(authState.token) &&
          <ChartQueryView
            initialQuery={makeProgressionListQuery(authState.uid)}
            renderQueryResults={({ query }) => (
              <ProgressionList
                query={query}
                editChart={(chart) => undefined /* TODO */}
              />
            )}
          />
        }
    </AppScreen>
  );
};

export default withAuth(ProgressionListScreen);
