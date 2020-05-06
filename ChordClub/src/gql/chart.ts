import gql from 'graphql-tag';
import {
  ChartNew,
  Chart,
  ChartQuery,
  ChartType,
  ChartUpdate,
  ReactionNew,
} from '../types';
import {tagDBFields} from './tag';

export const chartQueryFields = gql`
  fragment ChartQueryFields on ChartQuery {
    id
    tagIDs
    chartTypes
    after
    order
    asc
    limit
    scopes
  }
`;

export const chartDBFields = gql`
  fragment ChartDBFields on Chart {
    id
    name
    audioURL
    audioLength
    imageURL
    hint
    description
    abc
    scope
    chartType
    bassNote
    root
    quality
    createdAt
    createdBy
    updatedAt
  }
`;

export const CREATE_CHART_NEW = gql`
  mutation CreateChartNew($chartNew: ChartNew!) {
    createChart(chartNew: $chartNew) {
      ...ChartDBFields
    }
  }
  ${chartDBFields}
`;

export interface CreateChartVariables {
  chartNew: ChartNew;
}

export interface CreateChartResponse {
  createChart: Chart;
}

export const UPDATE_CHART = gql`
  mutation UpdateChart($chartUpdate: ChartUpdate!) {
    updateChart(chartUpdate: $chartUpdate) {
      ...ChartDBFields
      extensions {
        id
        degree
        extensionType
      }
    }
  }
  ${chartDBFields}
`;

export interface UpdateChartVariables {
  chartUpdate: ChartUpdate;
}

export interface UpdateChartResponse {
  updateChart: Chart;
}

export const CHARTS_QUERY = gql`
  query ChartsQuery($query: ChartQueryInput!) {
    charts(query: $query) {
      ...ChartDBFields
      userReactionType
      creator {
        uid
        username
      }
      reactionCounts {
        stars
      }
      tags {
        ...TagDBFields
        tagPosition
      }
    }
  }
  ${chartDBFields}
  ${tagDBFields}
`;

export interface ChartsQueryVariables {
  query: ChartQuery;
}

export interface ChartsQueryResponse {
  charts: Chart[];
}

export const CHART_EXTENSIONS_QUERY = gql`
  query ChartsExtensionsQuery($chartID: Int!, $chartTypes: [ChartType!]!) {
    charts(query: {id: $chartID, chartTypes: $chartTypes}) {
      extensions {
        id
        degree
        extensionType
      }
    }
  }
`;

export interface ChartExtensionsQueryVariables {
  chartID: number;
  chartTypes: ChartType[];
}

export interface ChartExtensionsQueryResponse {
  charts: Chart[];
}

export const DELETE_CHART_MUTATION = gql`
  mutation DeleteChartMutation($chartID: Int!) {
    deleteChart(chartID: $chartID) {
      empty
    }
  }
`;

export interface DeleteChartMutationVariables {
  chartID: number;
}

export const REACT_TO_CHART = gql`
  mutation ReactToChart($reactionNew: ReactionNew!) {
    react(reactionNew: $reactionNew) {
      id
      userReactionType
      reactionCounts {
        stars
      }
    }
  }
`;

export interface ReactToChartVariables {
  reactionNew: ReactionNew;
}

export interface ReactToChartResponse {
  react: Partial<Chart>;
}
