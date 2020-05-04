import React, { createContext, PropsWithChildren } from 'react';
import { ChartQuery, ChartType, BaseScopes, ChartQueryOrder } from '../types';

interface ChartQueryState {
  progressions: ChartQuery,
  chords: ChartQuery,
  flashCards: ChartQuery,
}

const initialState = {
  progressions: {
    chartTypes: [ChartType.Progression],
    scopes: [BaseScopes.Public],
    order: ChartQueryOrder.CreatedAt,
    asc: false,
  },
  chords: {
    chartTypes: [ChartType.Chord],
    scopes: [BaseScopes.Public],
    order: ChartQueryOrder.CreatedAt,
    asc: false,
  },
  flashCards: {
    chartTypes: [ChartType.Chord],
    scopes: [BaseScopes.Public],
    order: ChartQueryOrder.Random,
  },
};

export const ChartQueryContext = createContext<ChartQueryState>(initialState);

export class ChartQueryProvider extends React.Component<{}, ChartQueryState> {
  public state: ChartQueryState = initialState;




  public render() {
    return (
      <ChartQueryContext.Provider value={this.state}>
        {this.props.children}
      </ChartQueryContext.Provider>
    );
  }
}

export interface ChartQueryConsumerProps {
  chartQueryState: ChartQueryState;
}

export const withChartQuery = <P extends {}>(Component: React.ComponentType<P & ChartQueryConsumerProps>) => {
  return (props: PropsWithChildren<P>) => (
    <ChartQueryContext.Consumer>
      {(value: ChartQueryState) => (
        <Component
          chartQueryState={value}
          {...props}
        />
      )}
    </ChartQueryContext.Consumer>
  );
};
